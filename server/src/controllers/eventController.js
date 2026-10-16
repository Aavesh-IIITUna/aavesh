import { asyncHandler, ApiError } from '../middleware/errorHandler.js';
import { PERMISSIONS, userHasPermission } from '../middleware/permissions.js';

const getDatabase = async (db) => db ?? (await import('../config/prisma.js')).prisma;
const isObjectId = (value) => typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);
const eventFields = ['title', 'description', 'location', 'startsAt', 'endsAt', 'status'];
const statuses = ['DRAFT', 'PUBLISHED', 'CANCELLED'];

const eventResponse = ({ id, version, ...event }) => ({
  _id: id,
  ...Object.fromEntries(Object.entries(event).filter(([, value]) => value !== null)),
  __v: version,
});

const validateBody = (body, { partial = false } = {}) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new ApiError(400, 'Event details must be an object.');
  if (Object.keys(body).some((key) => !eventFields.includes(key))) throw new ApiError(400, 'Unexpected event field.');
  if (!partial && (typeof body.title !== 'string' || !body.title.trim())) throw new ApiError(400, 'Event title is required.');
  if (!partial && body.startsAt === undefined) throw new ApiError(400, 'Event start time is required.');

  const data = {};
  for (const field of ['title', 'description', 'location']) {
    if (!Object.hasOwn(body, field)) continue;
    if (field === 'title') {
      if (typeof body.title !== 'string' || !body.title.trim() || body.title.trim().length > 160) throw new ApiError(400, 'Event title must be between 1 and 160 characters.');
      data.title = body.title.trim();
    } else if (body[field] === null && field !== 'title') {
      data[field] = null;
    } else if (typeof body[field] === 'string' && body[field].trim().length <= (field === 'description' ? 5000 : 200)) {
      data[field] = body[field].trim();
    } else {
      throw new ApiError(400, `Invalid ${field}.`);
    }
  }
  for (const field of ['startsAt', 'endsAt']) {
    if (!Object.hasOwn(body, field)) 
      continue;
    if (field === 'endsAt' && body[field] === null) {
      data.endsAt = null;
      continue;
    }
    if (typeof body[field] !== 'string' || !body[field].trim()) throw new ApiError(400, `Invalid ${field} date.`);
    const date = new Date(body[field]);
    if (Number.isNaN(date.getTime())) throw new ApiError(400, `Invalid ${field} date.`);
    data[field] = date;
  }
  if (Object.hasOwn(body, 'status')) {
    if (!statuses.includes(body.status)) throw new ApiError(400, 'Invalid event status.');
    data.status = body.status;
  }
  return data;
};

const validateDateRange = (startsAt, endsAt) => {
  if (endsAt && endsAt < startsAt) throw new ApiError(400, 'Event end time must be after its start time.');
};

export const createEventHandlers = (db) => ({
  listEvents: asyncHandler(async (req, res) => {
    const client = await getDatabase(db);
    const canManage = req.user && await userHasPermission(client, req.user, PERMISSIONS.EVENTS_MANAGE);
    const events = await client.event.findMany({
      where: canManage ? {} : { status: 'PUBLISHED' },
      orderBy: { startsAt: 'asc' },
    });
    res.json(events.map(eventResponse));
  }),

  getEvent: asyncHandler(async (req, res) => {
    const client = await getDatabase(db);
    if (!isObjectId(req.params.id)) throw new ApiError(400, 'Invalid event id.');
    const event = await client.event.findUnique({ where: { id: req.params.id } });
    const canManage = req.user && await userHasPermission(client, req.user, PERMISSIONS.EVENTS_MANAGE);
    if (!event || (!canManage && event.status !== 'PUBLISHED')) throw new ApiError(404, 'Event not found.');
    res.json(eventResponse(event));
  }),

  createEvent: asyncHandler(async (req, res) => {
    const client = await getDatabase(db);
    const data = validateBody(req.body);
    validateDateRange(data.startsAt, data.endsAt);
    const now = new Date();
    const event = await client.event.create({ data: { ...data, version: 0, createdAt: now, updatedAt: now } });
    res.status(201).json(eventResponse(event));
  }),

  updateEvent: asyncHandler(async (req, res) => {
    const client = await getDatabase(db);
    const { id } = req.params;
    if (!isObjectId(id)) throw new ApiError(400, 'Invalid event id.');
    const data = validateBody(req.body, { partial: true });
    if (!Object.keys(data).length) throw new ApiError(400, 'Provide at least one event field to update.');
    const existing = await client.event.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, 'Event not found.');
    validateDateRange(data.startsAt ?? existing.startsAt, Object.hasOwn(data, 'endsAt') ? data.endsAt : existing.endsAt);
    const event = await client.event.update({ where: { id }, data: { ...data, updatedAt: new Date(), version: existing.version + 1 } });
    res.json(eventResponse(event));
  }),

  deleteEvent: asyncHandler(async (req, res) => {
    const client = await getDatabase(db);
    if (!isObjectId(req.params.id)) throw new ApiError(400, 'Invalid event id.');
    try {
      await client.event.delete({ where: { id: req.params.id } });
    } catch (error) {
      if (error.code === 'P2025') throw new ApiError(404, 'Event not found.');
      throw error;
    }
    res.status(204).end();
  }),
});

const handlers = createEventHandlers();
export const listEvents = handlers.listEvents;
export const getEvent = handlers.getEvent;
export const createEvent = handlers.createEvent;
export const updateEvent = handlers.updateEvent;
export const deleteEvent = handlers.deleteEvent;

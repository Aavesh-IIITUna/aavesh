import { asyncHandler, ApiError } from '../middleware/errorHandler.js';

const getDatabase = async (db) => db ?? (await import('../config/prisma.js')).prisma;
const isObjectId = (value) => typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);
const textFields = ['name', 'role', 'track', 'email', 'github', 'linkedin'];
const allowedFields = [...textFields, 'joinedYear', 'active'];

const validateMember = (body, { partial = false } = {}) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new ApiError(400, 'Member details must be an object.');
  if (Object.keys(body).some((key) => !allowedFields.includes(key))) throw new ApiError(400, 'Unexpected member field.');
  if (!partial && (typeof body.name !== 'string' || !body.name.trim())) throw new ApiError(400, 'Member name is required.');
  const data = {};
  for (const field of textFields) {
    if (!Object.hasOwn(body, field)) continue;
    if (field === 'name') {
      if (typeof body.name !== 'string' || !body.name.trim() || body.name.trim().length > 100) throw new ApiError(400, 'Member name must be between 1 and 100 characters.');
      data.name = body.name.trim();
    } else if (body[field] === null) {
      data[field] = null;
    } else if (typeof body[field] === 'string' && body[field].trim().length <= 500) {
      data[field] = field === 'email' ? body[field].trim().toLowerCase() : body[field].trim();
    } else {
      throw new ApiError(400, `Invalid member ${field}.`);
    }
  }
  if (Object.hasOwn(body, 'email') && data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    throw new ApiError(400, 'Invalid member email.');
  }
  if (Object.hasOwn(body, 'joinedYear')) {
    if (body.joinedYear === null) data.joinedYear = null;
    else if (Number.isInteger(body.joinedYear) && body.joinedYear >= 1900 && body.joinedYear <= 2200) data.joinedYear = body.joinedYear;
    else throw new ApiError(400, 'Invalid joined year.');
  }
  if (Object.hasOwn(body, 'active')) {
    if (typeof body.active !== 'boolean') throw new ApiError(400, 'Active must be a boolean.');
    data.active = body.active;
  }
  return data;
};

const toApi = ({ id, version, ...member }) => ({
  _id: id,
  ...Object.fromEntries(Object.entries(member).filter(([, value]) => value !== null)),
  ...(version == null ? {} : { __v: version }),
});

const mapDatabaseError = (error) => {
  if (error.code === 'P2002') return new ApiError(409, 'A member with this name already exists.');
  if (error.code === 'P2025') return new ApiError(404, 'Member not found.');
  return error;
};

export const createMemberAdminHandlers = (db) => ({
  listManagedMembers: asyncHandler(async (req, res) => {
    const client = await getDatabase(db);
    const members = await client.member.findMany({ orderBy: { name: 'asc' } });
    res.json(members.map(toApi));
  }),

  createMember: asyncHandler(async (req, res) => {
    const client = await getDatabase(db);
    const data = validateMember(req.body);
    const now = new Date();
    try {
      const member = await client.member.create({ data: { ...data, active: data.active ?? true, version: 0, createdAt: now, updatedAt: now } });
      res.status(201).json(toApi(member));
    } catch (error) {
      throw mapDatabaseError(error);
    }
  }),

  updateMember: asyncHandler(async (req, res) => {
    const client = await getDatabase(db);
    if (!isObjectId(req.params.id)) throw new ApiError(400, 'Invalid member id.');
    const data = validateMember(req.body, { partial: true });
    if (!Object.keys(data).length) throw new ApiError(400, 'Provide at least one member field to update.');
    try {
      const member = await client.member.update({ where: { id: req.params.id }, data: { ...data, updatedAt: new Date() } });
      res.json(toApi(member));
    } catch (error) {
      throw mapDatabaseError(error);
    }
  }),

  deleteMember: asyncHandler(async (req, res) => {
    const client = await getDatabase(db);
    if (!isObjectId(req.params.id)) throw new ApiError(400, 'Invalid member id.');
    try {
      await client.member.delete({ where: { id: req.params.id } });
    } catch (error) {
      throw mapDatabaseError(error);
    }
    res.status(204).end();
  }),
});

const handlers = createMemberAdminHandlers();
export const listManagedMembers = handlers.listManagedMembers;
export const createMember = handlers.createMember;
export const updateMember = handlers.updateMember;
export const deleteMember = handlers.deleteMember;

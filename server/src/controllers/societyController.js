import { Society } from '../models/Society.js';
import { prisma } from '../config/prisma.js';
import { asyncHandler, ApiError } from '../middleware/errorHandler.js';

// GET /api/society — full profile powering the landing page
export const getSociety = asyncHandler(async (req, res) => {
  const society = await Society.findOne({ key: 'aavesh' }).lean();
  if (!society) {
    throw new ApiError(404, 'Society profile not initialised. Run `npm run seed --workspace server`.');
  }
  res.json(society);
});

// GET /api/society/tracks
export const getTracks = asyncHandler(async (req, res) => {
  const society = await prisma.society.findUnique({
    where: { key: 'aavesh' },
    select: { tracks: true },
  });
  res.json(society?.tracks ?? []);
});

// GET /api/projects?status=active
export const listProjects = asyncHandler(async (req, res) => {
  const { status, track } = req.query;

  if (status !== undefined && typeof status !== 'string') {
    throw new ApiError(400, 'The status filter must be a single string value.');
  }

  const where = {};
  if (status) {
    const validStatuses = ['active', 'archived', 'prototype'];
    if (!validStatuses.includes(status)) return res.json([]);
    where.status = status;
  }
  if (track) where.track = track;

  const projects = await prisma.project.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  const response = projects.map(({ id, version, ...project }) => {
    const fields = Object.fromEntries(
      Object.entries(project).filter(([, value]) => value !== null),
    );

    return {
      _id: id,
      ...fields,
      ...(version == null ? {} : { __v: version }),
    };
  });

  res.json(response);
});

// GET /api/members
export const listMembers = asyncHandler(async (req, res) => {
  const members = await prisma.member.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
  });

  const response = members.map(({ id, version, ...member }) => {
    const fields = Object.fromEntries(
      Object.entries(member).filter(([, value]) => value !== null),
    );

    return {
      _id: id,
      ...fields,
      ...(version == null ? {} : { __v: version }),
    };
  });

  res.json(response);
});

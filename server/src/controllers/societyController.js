import { Society } from '../models/Society.js';
import { Project } from '../models/Project.js';
import { Member } from '../models/Member.js';
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
  const society = await Society.findOne({ key: 'aavesh' }, { tracks: 1 }).lean();
  res.json(society?.tracks ?? []);
});

// GET /api/projects?status=active
export const listProjects = asyncHandler(async (req, res) => {
  const { status, track } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (track) filter.track = track;

  const projects = await Project.find(filter).sort({ createdAt: -1 }).lean();
  res.json(projects);
});

// GET /api/members
export const listMembers = asyncHandler(async (req, res) => {
  const members = await Member.find({ active: true }).sort({ name: 1 }).lean();
  res.json(members);
});
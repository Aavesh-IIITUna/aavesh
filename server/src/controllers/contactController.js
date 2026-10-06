import { ContactMessage } from '../models/ContactMessage.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// POST /api/contact
export const createMessage = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body ?? {};
  const created = await ContactMessage.create({ name, email, subject, message });
  res.status(201).json({ id: created._id, received: true });
});

// GET /api/contact (admin-less listing, useful for triage during development)
export const listMessages = asyncHandler(async (req, res) => {
  const messages = await ContactMessage.find().sort({ createdAt: -1 }).limit(50).lean();
  res.json(messages);
});
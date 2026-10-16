import { asyncHandler, ApiError } from '../middleware/errorHandler.js';
import { getEffectivePermissions } from '../middleware/permissions.js';

const getDatabase = async (db) => db ?? (await import('../config/prisma.js')).prisma;
const profileSelect = { id: true, email: true, displayName: true, profileImageUrl: true };

export const createProfileHandlers = (db) => ({
  getProfile: asyncHandler(async (req, res) => {
    const client = await getDatabase(db);
    const user = await client.user.findUnique({ where: { id: req.user.id }, select: profileSelect });
    if (!user) throw new ApiError(404, 'Profile not found.');
    const permissions = [...(await getEffectivePermissions(client, req.user))];
    res.json({ user: { ...user, roleKeys: req.user.roleKeys, permissions } });
  }),

  updateProfile: asyncHandler(async (req, res) => {
    const client = await getDatabase(db);
    const body = req.body ?? {};
    const allowed = ['displayName', 'profileImageUrl'];
    if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some((key) => !allowed.includes(key))) {
      throw new ApiError(400, 'Only displayName and profileImageUrl can be updated.');
    }
    const data = {};
    if (Object.hasOwn(body, 'displayName')) {
      if (typeof body.displayName !== 'string' || !body.displayName.trim() || body.displayName.trim().length > 100) {
        throw new ApiError(400, 'Display name must be between 1 and 100 characters.');
      }
      data.displayName = body.displayName.trim();
    }
    if (Object.hasOwn(body, 'profileImageUrl')) {
      if (body.profileImageUrl === null) {
        data.profileImageUrl = null;
      } else if (typeof body.profileImageUrl === 'string') {
        try {
          const imageUrl = new URL(body.profileImageUrl);
          if (imageUrl.protocol !== 'https:' || imageUrl.href.length > 2048) throw new Error('invalid');
          data.profileImageUrl = imageUrl.href;
        } catch {
          throw new ApiError(400, 'Profile image must be an HTTPS URL or null.');
        }
      } else {
        throw new ApiError(400, 'Profile image must be an HTTPS URL or null.');
      }
    }
    if (!Object.keys(data).length) throw new ApiError(400, 'Provide at least one profile field to update.');

    const user = await client.user.update({ where: { id: req.user.id }, data, select: profileSelect });
    const permissions = [...(await getEffectivePermissions(client, req.user))];
    res.json({ user: { ...user, roleKeys: req.user.roleKeys, permissions } });
  }),
});

const handlers = createProfileHandlers();
export const getProfile = handlers.getProfile;
export const updateProfile = handlers.updateProfile;

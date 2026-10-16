import { asyncHandler, ApiError } from './errorHandler.js';
import { hashToken, readSessionToken } from '../controllers/authController.js';

export const createAuthContext = (db, { optional = false } = {}) => asyncHandler(async (req, res, next) => {
  const token = readSessionToken(req);
  if (!token) {
    if (optional) return next();
    throw new ApiError(401, 'Authentication required.');
  }

  const client = db ?? (await import('../config/prisma.js')).prisma;
  const session = await client.authSession.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!session || session.expiresAt <= new Date()) {
    if (optional) return next();
    throw new ApiError(401, 'Authentication required.');
  }

  const user = await client.user.findUnique({ where: { id: session.userId } });
  if (!user || user.status !== 'ACTIVE') {
    if (optional) return next();
    throw new ApiError(401, 'Authentication required.');
  }

  req.user = {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    profileImageUrl: user.profileImageUrl ?? null,
    roleKeys: user.roleKeys,
    permissions: user.permissions,
  };
  return next();
});

export const createRequireAuth = (db) => createAuthContext(db);
export const createOptionalAuth = (db) => createAuthContext(db, { optional: true });
export const requireAuth = createRequireAuth();
export const optionalAuth = createOptionalAuth();

import { asyncHandler, ApiError } from './errorHandler.js';

export const PERMISSIONS = Object.freeze({
  MEMBERS_MANAGE: 'members.manage',
  EVENTS_MANAGE: 'events.manage',
  CONTACTS_READ: 'contacts.read',
  ROLES_MANAGE: 'roles.manage',
});

// These are the only permissions Presidents may delegate. Role administration
// stays reserved to the President role and Developer; it cannot be delegated.
export const DELEGABLE_PERMISSIONS = Object.freeze([
  PERMISSIONS.MEMBERS_MANAGE,
  PERMISSIONS.EVENTS_MANAGE,
  PERMISSIONS.CONTACTS_READ,
]);
export const RESERVED_ROLE_KEYS = Object.freeze(['developer', 'president', 'secretary', 'member']);

export const isDeveloper = (user) => (user?.roleKeys ?? []).includes('developer');

export const getEffectivePermissions = async (db, user) => {
  if (isDeveloper(user)) return new Set(['*']);

  const roleKeys = [...new Set(user?.roleKeys ?? [])];
  const roles = roleKeys.length
    ? await db.role.findMany({ where: { key: { in: roleKeys } }, select: { permissions: true } })
    : [];
  const permissions = new Set((user?.permissions ?? []).filter((permission) => DELEGABLE_PERMISSIONS.includes(permission)));

  for (const role of roles) {
    for (const permission of role.permissions) {
      if (DELEGABLE_PERMISSIONS.includes(permission)) permissions.add(permission);
    }
  }

  // President authority is limited to permission and role administration; the
  // President role cannot implicitly manage members, events, or the inbox.
  if (roleKeys.includes('president')) permissions.add(PERMISSIONS.ROLES_MANAGE);
  return permissions;
};

export const userHasPermission = async (db, user, permission) => {
  if (isDeveloper(user)) return true;
  const permissions = await getEffectivePermissions(db, user);
  return permissions.has(permission);
};

export const createRequirePermission = (db, permission) => asyncHandler(async (req, res, next) => {
  if (!req.user) throw new ApiError(401, 'Authentication required.');
  const client = db ?? (await import('../config/prisma.js')).prisma;
  if (!(await userHasPermission(client, req.user, permission))) {
    throw new ApiError(403, 'You do not have permission to perform this action.');
  }
  return next();
});

export const requirePermission = (permission) => createRequirePermission(undefined, permission);

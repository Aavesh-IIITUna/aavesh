import { asyncHandler, ApiError } from '../middleware/errorHandler.js';
import { DELEGABLE_PERMISSIONS, RESERVED_ROLE_KEYS, isDeveloper } from '../middleware/permissions.js';

const getDatabase = async (db) => db ?? (await import('../config/prisma.js')).prisma;
const isObjectId = (value) => typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);
const isRoleKey = (value) => typeof value === 'string' && /^[a-z][a-z0-9-]{1,39}$/.test(value);

const validatePermissions = (permissions) => {
  if (!Array.isArray(permissions) || permissions.some((permission) => !DELEGABLE_PERMISSIONS.includes(permission))) {
    throw new ApiError(400, 'Permissions must be selected from the supported permission list.');
  }
  return [...new Set(permissions)];
};

const validateChanges = (body, field) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ApiError(400, 'Provide grant and revoke arrays.');
  }
  const allowed = new Set(['grant', 'revoke']);
  if (Object.keys(body).some((key) => !allowed.has(key))) throw new ApiError(400, 'Unexpected fields.');
  const grant = body.grant ?? [];
  const revoke = body.revoke ?? [];
  const valid = field === 'permission' ? DELEGABLE_PERMISSIONS : null;
  if (!Array.isArray(grant) || !Array.isArray(revoke) || [...grant, ...revoke].some((value) => typeof value !== 'string')) {
    throw new ApiError(400, 'Provide grant and revoke arrays of strings.');
  }
  if (valid && [...grant, ...revoke].some((value) => !valid.includes(value))) {
    throw new ApiError(400, 'Permissions must be selected from the supported permission list.');
  }
  if (grant.some((value) => revoke.includes(value))) throw new ApiError(400, 'A value cannot be granted and revoked together.');
  return { grant: [...new Set(grant)], revoke: [...new Set(revoke)] };
};

const roleResponse = ({ id, key, name, permissions, system, createdAt, updatedAt }) => ({
  _id: id,
  key,
  name,
  permissions,
  system,
  createdAt,
  updatedAt,
});

export const createRoleHandlers = (db) => {
  const listRoles = asyncHandler(async (req, res) => {
    const client = await getDatabase(db);
    const roles = await client.role.findMany({ orderBy: { name: 'asc' } });
    res.json(roles.map(roleResponse));
  });

  const listUsers = asyncHandler(async (req, res) => {
    const client = await getDatabase(db);
    const users = await client.user.findMany({
      orderBy: { displayName: 'asc' },
      select: { id: true, email: true, displayName: true, status: true, roleKeys: true, permissions: true, createdAt: true },
    });
    res.json(users);
  });

  const createRole = asyncHandler(async (req, res) => {
    const client = await getDatabase(db);
    const body = req.body ?? {};
    if (Object.keys(body).some((key) => !['key', 'name', 'permissions'].includes(key))) throw new ApiError(400, 'Unexpected fields.');
    if (!isRoleKey(body.key) || RESERVED_ROLE_KEYS.includes(body.key)) throw new ApiError(400, 'Choose a non-reserved role key.');
    if (typeof body.name !== 'string' || body.name.trim().length < 2 || body.name.trim().length > 60) {
      throw new ApiError(400, 'Role name must be between 2 and 60 characters.');
    }

    try {
      const role = await client.role.create({
        data: {
          key: body.key,
          name: body.name.trim(),
          permissions: validatePermissions(body.permissions ?? []),
          system: false,
        },
      });
      res.status(201).json(roleResponse(role));
    } catch (error) {
      if (error.code === 'P2002') throw new ApiError(409, 'A role with this key already exists.');
      throw error;
    }
  });

  const updateRole = asyncHandler(async (req, res) => {
    const client = await getDatabase(db);
    const { roleKey } = req.params;
    const body = req.body ?? {};
    if (!isRoleKey(roleKey) || RESERVED_ROLE_KEYS.includes(roleKey)) throw new ApiError(400, 'Built-in roles cannot be changed.');
    if (Object.keys(body).some((key) => !['name', 'permissions'].includes(key)) || !Object.keys(body).length) {
      throw new ApiError(400, 'Provide a role name or permissions to update.');
    }
    const existing = await client.role.findUnique({ where: { key: roleKey } });
    if (!existing || existing.system) throw new ApiError(404, 'Role not found.');

    // A President must not gain permissions by editing a custom role already
    // assigned to their own account or another Developer/President account.
    // Developers are the only actors allowed to change those assignments.
    if (!isDeveloper(req.user)) {
      const assignedUsers = await client.user.findMany({
        where: { roleKeys: { has: roleKey } },
        select: { roleKeys: true },
      });
      if (assignedUsers.some(({ roleKeys }) => roleKeys.some((key) => ['developer', 'president'].includes(key)))) {
        throw new ApiError(403, 'Only a Developer can change a role assigned to a Developer or President.');
      }
    }

    const data = {};
    if (Object.hasOwn(body, 'name')) {
      if (typeof body.name !== 'string' || body.name.trim().length < 2 || body.name.trim().length > 60) {
        throw new ApiError(400, 'Role name must be between 2 and 60 characters.');
      }
      data.name = body.name.trim();
    }
    if (Object.hasOwn(body, 'permissions')) data.permissions = validatePermissions(body.permissions);
    const role = await client.role.update({ where: { key: roleKey }, data });
    res.json(roleResponse(role));
  });

  const changeUserRoles = asyncHandler(async (req, res) => {
    const client = await getDatabase(db);
    const { userId } = req.params;
    if (!isObjectId(userId)) throw new ApiError(400, 'Invalid user id.');
    const { grant, revoke } = validateChanges(req.body, 'role');
    if (!grant.length && !revoke.length) throw new ApiError(400, 'Provide at least one role to grant or revoke.');

    const target = await client.user.findUnique({ where: { id: userId } });
    if (!target) throw new ApiError(404, 'User not found.');
    const actorIsDeveloper = isDeveloper(req.user);
    if (!actorIsDeveloper && req.user.id === userId) {
      throw new ApiError(403, 'You cannot change your own role assignments.');
    }
    if (!actorIsDeveloper && target.roleKeys.some((key) => ['developer', 'president'].includes(key))) {
      throw new ApiError(403, 'Only a Developer can change a Developer or President account.');
    }
    if (!actorIsDeveloper && grant.some((key) => ['developer', 'president'].includes(key))) {
      throw new ApiError(403, 'Only a Developer can grant Developer or President access.');
    }

    const allowedBuiltIns = new Set(['member', 'secretary', 'president', 'developer']);
    for (const key of [...grant, ...revoke]) {
      if (!isRoleKey(key)) throw new ApiError(400, 'Invalid role key.');
      if (!allowedBuiltIns.has(key) && !(await client.role.findUnique({ where: { key } }))) {
        throw new ApiError(404, `Role "${key}" not found.`);
      }
    }

    const roleKeys = new Set(target.roleKeys);
    for (const key of grant) roleKeys.add(key);
    for (const key of revoke) roleKeys.delete(key);
    const user = await client.user.update({ where: { id: userId }, data: { roleKeys: [...roleKeys] } });
    res.json({ userId: user.id, roleKeys: user.roleKeys });
  });

  const changeUserPermissions = asyncHandler(async (req, res) => {
    const client = await getDatabase(db);
    const { userId } = req.params;
    if (!isObjectId(userId)) throw new ApiError(400, 'Invalid user id.');
    const { grant, revoke } = validateChanges(req.body, 'permission');
    if (!grant.length && !revoke.length) throw new ApiError(400, 'Provide at least one permission to grant or revoke.');
    const target = await client.user.findUnique({ where: { id: userId } });
    if (!target) throw new ApiError(404, 'User not found.');
    if (!isDeveloper(req.user) && req.user.id === userId) {
      throw new ApiError(403, 'You cannot change your own permissions.');
    }
    if (!isDeveloper(req.user) && target.roleKeys.some((key) => ['developer', 'president'].includes(key))) {
      throw new ApiError(403, 'Only a Developer can change a Developer or President account.');
    }

    const permissions = new Set(target.permissions);
    for (const permission of grant) permissions.add(permission);
    for (const permission of revoke) permissions.delete(permission);
    const user = await client.user.update({ where: { id: userId }, data: { permissions: [...permissions] } });
    res.json({ userId: user.id, permissions: user.permissions });
  });

  return { listRoles, listUsers, createRole, updateRole, changeUserRoles, changeUserPermissions };
};

const handlers = createRoleHandlers();
export const listRoles = handlers.listRoles;
export const listUsers = handlers.listUsers;
export const createRole = handlers.createRole;
export const updateRole = handlers.updateRole;
export const changeUserRoles = handlers.changeUserRoles;
export const changeUserPermissions = handlers.changeUserPermissions;

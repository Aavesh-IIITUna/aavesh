import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { asyncHandler, ApiError } from '../middleware/errorHandler.js';
import { getEffectivePermissions } from '../middleware/permissions.js';

const scrypt = promisify(scryptCallback);
const SESSION_COOKIE = 'aavesh_session';
const SESSION_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;
const PASSWORD_SCRYPT_OPTIONS = { N: 32768, r: 8, p: 1, maxmem: 128 * 1024 * 1024 };

const cookieOptions = (isProduction) => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax',
  path: '/api',
  maxAge: SESSION_LIFETIME_MS,
});

const hashPassword = async (password) => {
  const salt = randomBytes(16);
  const derivedKey = await scrypt(password, salt, 64, PASSWORD_SCRYPT_OPTIONS);
  return `scrypt$32768$8$1$${salt.toString('base64url')}$${derivedKey.toString('base64url')}`;
};

const verifyPassword = async (password, encoded) => {
  const parts = encoded.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt' || parts[1] !== '32768' || parts[2] !== '8' || parts[3] !== '1') {
    return false;
  }

  try {
    const salt = Buffer.from(parts[4], 'base64url');
    const expected = Buffer.from(parts[5], 'base64url');
    if (salt.length !== 16 || expected.length !== 64) return false;
    const actual = await scrypt(password, salt, expected.length, PASSWORD_SCRYPT_OPTIONS);
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
};

const normalizedEmail = (value) => {
  if (typeof value !== 'string') throw new ApiError(400, 'A valid email address is required.');
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError(400, 'A valid email address is required.');
  }
  return email;
};

const readSessionToken = (req) => {
  const cookieHeader = req.headers?.cookie;
  if (typeof cookieHeader !== 'string') return null;

  for (const pair of cookieHeader.split(';')) {
    const separator = pair.indexOf('=');
    if (separator < 0 || pair.slice(0, separator).trim() !== SESSION_COOKIE) continue;
    try {
      const token = decodeURIComponent(pair.slice(separator + 1).trim());
      return /^[a-f0-9]{64}$/.test(token) ? token : null;
    } catch {
      return null;
    }
  }
  return null;
};

const hashToken = (token) => createHash('sha256').update(token).digest('hex');
const getDatabase = async (db) => db ?? (await import('../config/prisma.js')).prisma;

const publicUser = (user, permissions = user.permissions) => ({
  id: user.id,
  email: user.email,
  displayName: user.displayName,
  roleKeys: user.roleKeys,
  permissions,
});

export const createAuthHandlers = (db, { isProduction = process.env.NODE_ENV === 'production' } = {}) => {
  const register = asyncHandler(async (req, res) => {
    const client = await getDatabase(db);
    const body = req.body ?? {};
    if (['role', 'roles', 'roleKeys', 'permissions'].some((key) => Object.hasOwn(body, key))) {
      throw new ApiError(400, 'Roles and permissions cannot be set during registration.');
    }

    const email = normalizedEmail(body.email);
    if (typeof body.displayName !== 'string') throw new ApiError(400, 'A display name is required.');
    const displayName = body.displayName.trim();
    if (!displayName || displayName.length > 100) {
      throw new ApiError(400, 'Display name must be between 1 and 100 characters.');
    }
    if (typeof body.password !== 'string' || body.password.length < 12 || body.password.length > 128) {
      throw new ApiError(400, 'Password must be between 12 and 128 characters.');
    }

    const passwordHash = await hashPassword(body.password);
    let user;
    try {
      user = await client.user.create({
        data: {
          email,
          passwordHash,
          displayName,
          status: 'ACTIVE',
          roleKeys: ['member'],
          permissions: [],
        },
      });
    } catch (error) {
      if (error.code === 'P2002') throw new ApiError(409, 'An account with this email already exists.');
      throw error;
    }

    const token = randomBytes(32).toString('hex');
    await client.authSession.create({
      data: {
        tokenHash: hashToken(token),
        userId: user.id,
        expiresAt: new Date(Date.now() + SESSION_LIFETIME_MS),
      },
    });

    const permissions = [...(await getEffectivePermissions(client, user))];
    res.cookie(SESSION_COOKIE, token, cookieOptions(isProduction));
    res.status(201).json({ user: publicUser(user, permissions) });
  });

  const login = asyncHandler(async (req, res) => {
    const client = await getDatabase(db);
    const body = req.body ?? {};
    const email = normalizedEmail(body.email);
    if (typeof body.password !== 'string' || body.password.length > 128) {
      throw new ApiError(400, 'Email and password are required.');
    }

    const user = await client.user.findUnique({ where: { email } });
    if (!user) {
      // Spend comparable password-hashing work for unknown accounts to reduce email enumeration timing.
      await hashPassword(body.password);
      throw new ApiError(401, 'Invalid email or password.');
    }
    if (user.status !== 'ACTIVE' || !(await verifyPassword(body.password, user.passwordHash))) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    const token = randomBytes(32).toString('hex');
    await client.authSession.create({
      data: {
        tokenHash: hashToken(token),
        userId: user.id,
        expiresAt: new Date(Date.now() + SESSION_LIFETIME_MS),
      },
    });

    const permissions = [...(await getEffectivePermissions(client, user))];
    res.cookie(SESSION_COOKIE, token, cookieOptions(isProduction));
    res.json({ user: publicUser(user, permissions) });
  });

  const logout = asyncHandler(async (req, res) => {
    const client = await getDatabase(db);
    const token = readSessionToken(req);
    if (token) {
      await client.authSession.deleteMany({ where: { tokenHash: hashToken(token) } });
    }
    const { httpOnly, secure, sameSite, path } = cookieOptions(isProduction);
    res.clearCookie(SESSION_COOKIE, { httpOnly, secure, sameSite, path });
    res.status(204).end();
  });

  return { register, login, logout };
};

const handlers = createAuthHandlers();
export const register = handlers.register;
export const login = handlers.login;
export const logout = handlers.logout;
export { readSessionToken, hashToken, SESSION_COOKIE };

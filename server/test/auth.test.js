import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuthHandlers, hashToken, SESSION_COOKIE } from '../src/controllers/authController.js';
import { createRequireAuth } from '../src/middleware/requireAuth.js';

const makeResponse = () => ({
  statusCode: 200,
  body: undefined,
  cookieValue: undefined,
  cookieOptions: undefined,
  cleared: false,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
  cookie(name, value, options) { this.cookieName = name; this.cookieValue = value; this.cookieOptions = options; return this; },
  clearCookie(name, options) { this.cleared = true; this.cookieName = name; this.clearOptions = options; return this; },
  end() { this.ended = true; return this; },
});

const callHandler = async (handler, req, res) => {
  let forwardedError;
  await handler(req, res, (error) => { forwardedError = error; });
  if (forwardedError) throw forwardedError;
};

const makeDatabase = () => {
  const users = new Map();
  const sessions = new Map();
  return {
    users,
    sessions,
    user: {
      async create({ data }) {
        if (users.has(data.email)) throw Object.assign(new Error('unique'), { code: 'P2002' });
        const user = { id: `user-${users.size + 1}`, ...data };
        users.set(data.email, user);
        return user;
      },
      async findUnique({ where }) {
        if (where.email) return users.get(where.email) ?? null;
        return [...users.values()].find(({ id }) => id === where.id) ?? null;
      },
    },
    role: {
      async findMany() { return []; },
    },
    authSession: {
      async create({ data }) {
        const session = { id: `session-${sessions.size + 1}`, ...data };
        sessions.set(data.tokenHash, session);
        return session;
      },
      async findUnique({ where }) { return sessions.get(where.tokenHash) ?? null; },
      async deleteMany({ where }) { return { count: Number(sessions.delete(where.tokenHash)) }; },
    },
  };
};

const registration = (extra = {}) => ({
  body: { email: '  MEMBER@example.com ', password: 'a-long-enough-password', displayName: '  A Member  ', ...extra },
  headers: {},
});

test('registration creates only member access and returns no password hash or token', async () => {
  const db = makeDatabase();
  const { register } = createAuthHandlers(db, { isProduction: false });
  const res = makeResponse();

  await callHandler(register, registration(), res);

  const stored = db.users.get('member@example.com');
  assert.equal(res.statusCode, 201);
  assert.equal(stored.displayName, 'A Member');
  assert.equal(stored.roleKeys.length, 1);
  assert.equal(stored.roleKeys[0], 'member');
  assert.deepEqual(stored.permissions, []);
  assert.match(stored.passwordHash, /^scrypt\$/);
  assert.equal(res.body.user.email, 'member@example.com');
  assert.equal('passwordHash' in res.body.user, false);
  assert.equal('token' in res.body, false);
  assert.equal(res.cookieName, SESSION_COOKIE);
  assert.equal(res.cookieOptions.httpOnly, true);
  assert.equal(res.cookieOptions.secure, false);
  assert.equal(res.cookieOptions.sameSite, 'lax');
});

test('registration rejects submitted role or permission fields', async () => {
  const db = makeDatabase();
  const { register } = createAuthHandlers(db);
  await assert.rejects(callHandler(register, registration({ role: 'Developer' }), makeResponse()), { statusCode: 400 });
  assert.equal(db.users.size, 0);
});

test('login accepts normalized email and sets a secure production cookie', async () => {
  const db = makeDatabase();
  const handlers = createAuthHandlers(db, { isProduction: true });
  await callHandler(handlers.register, registration(), makeResponse());
  const res = makeResponse();

  await callHandler(handlers.login, { body: { email: 'MEMBER@example.com', password: 'a-long-enough-password' }, headers: {} }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.cookieOptions.secure, true);
  assert.equal('passwordHash' in res.body.user, false);
  assert.equal('token' in res.body, false);
});

test('invalid credentials return the same generic unauthorized error', async () => {
  const db = makeDatabase();
  const { register, login } = createAuthHandlers(db);
  await callHandler(register, registration(), makeResponse());

  const errors = [];
  for (const body of [
    { email: 'member@example.com', password: 'incorrect-password' },
    { email: 'unknown@example.com', password: 'incorrect-password' },
  ]) {
    try {
      await callHandler(login, { body, headers: {} }, makeResponse());
    } catch (error) {
      errors.push(error);
    }
  }
  assert.equal(errors[0].statusCode, 401);
  assert.equal(errors[0].message, 'Invalid email or password.');
  assert.equal(errors[1].statusCode, 401);
  assert.equal(errors[1].message, errors[0].message);
});

test('logout revokes the presented session and clears the cookie', async () => {
  const db = makeDatabase();
  const handlers = createAuthHandlers(db);
  const loginResponse = makeResponse();
  await callHandler(handlers.register, registration(), makeResponse());
  await callHandler(handlers.login, { body: { email: 'member@example.com', password: 'a-long-enough-password' }, headers: {} }, loginResponse);
  const res = makeResponse();

  await callHandler(handlers.logout, { body: {}, headers: { cookie: `${SESSION_COOKIE}=${loginResponse.cookieValue}` } }, res);

  assert.equal(res.statusCode, 204);
  assert.equal(res.cleared, true);
  assert.equal(db.sessions.has(hashToken(loginResponse.cookieValue)), false);
});

test('authentication middleware rejects requests without a session', async () => {
  const requireAuth = createRequireAuth(makeDatabase());
  let forwardedError;

  await requireAuth({ headers: {} }, makeResponse(), (error) => { forwardedError = error; });

  assert.equal(forwardedError.statusCode, 401);
  assert.equal(forwardedError.message, 'Authentication required.');
});

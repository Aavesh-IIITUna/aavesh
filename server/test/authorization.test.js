import test from 'node:test';
import assert from 'node:assert/strict';
import { getEffectivePermissions, isDeveloper, PERMISSIONS, createRequirePermission, userHasPermission } from '../src/middleware/permissions.js';
import { createRoleHandlers } from '../src/controllers/roleController.js';
import { createProfileHandlers } from '../src/controllers/profileController.js';
import { createEventHandlers } from '../src/controllers/eventController.js';
import { createMemberAdminHandlers } from '../src/controllers/memberAdminController.js';

const id = '0123456789abcdef01234567';
const makeResponse = () => ({
  statusCode: 200,
  body: undefined,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
  end() { this.ended = true; return this; },
});
const invoke = async (handler, req, res = makeResponse()) => {
  let forwarded;
  await handler(req, res, (error) => { forwarded = error; });
  if (forwarded) throw forwarded;
  return res;
};

const makeDb = () => {
  const roles = new Map();
  const users = new Map([[id, { id, email: 'member@example.com', passwordHash: 'private-hash', displayName: 'Member', profileImageUrl: null, roleKeys: ['member'], permissions: [], status: 'ACTIVE' }]]);
  const events = new Map();
  return {
    roles,
    users,
    events,
    role: {
      async findMany(args = {}) {
        let found = [...roles.values()];
        if (args.where?.key?.in) found = found.filter((role) => args.where.key.in.includes(role.key));
        if (args.orderBy?.name) found.sort((a, b) => a.name.localeCompare(b.name));
        return found;
      },
      async findUnique({ where }) { return roles.get(where.key) ?? null; },
      async create({ data }) { const role = { id: `role-${roles.size}`, ...data, createdAt: new Date(), updatedAt: new Date() }; roles.set(role.key, role); return role; },
      async update({ where, data }) { const role = { ...roles.get(where.key), ...data, updatedAt: new Date() }; roles.set(where.key, role); return role; },
    },
    user: {
      async findUnique({ where, select }) {
        const user = users.get(where.id);
        if (!user || !select) return user ?? null;
        return Object.fromEntries(Object.keys(select).map((key) => [key, user[key]]));
      },
      async findMany({ where, select }) {
        let found = [...users.values()];
        if (where?.roleKeys?.has) found = found.filter((user) => user.roleKeys.includes(where.roleKeys.has));
        return found.map((user) => Object.fromEntries(Object.keys(select).map((key) => [key, user[key]])));
      },
      async update({ where, data, select }) {
        const user = { ...users.get(where.id), ...data };
        users.set(where.id, user);
        return select ? Object.fromEntries(Object.keys(select).map((key) => [key, user[key]])) : user;
      },
    },
    event: {
      async findMany({ where, orderBy }) {
        const found = [...events.values()].filter((event) => !where.status || event.status === where.status);
        if (orderBy?.startsAt) found.sort((a, b) => a.startsAt - b.startsAt);
        return found;
      },
      async findUnique({ where }) { return events.get(where.id) ?? null; },
      async create({ data }) { const event = { id: 'fedcba987654321001234567', ...data }; events.set(event.id, event); return event; },
      async update({ where, data }) { const event = { ...events.get(where.id), ...data }; events.set(where.id, event); return event; },
      async delete({ where }) { const event = events.get(where.id); events.delete(where.id); return event; },
    },
  };
};

test('Developer has full access while President receives only bounded role-management access', async () => {
  const db = makeDb();
  assert.equal(isDeveloper({ roleKeys: ['developer'] }), true);
  assert.equal(await getEffectivePermissions(db, { roleKeys: ['developer'], permissions: [] }).then((set) => set.has('*')), true);
  const president = await getEffectivePermissions(db, { roleKeys: ['president'], permissions: [] });
  assert.equal(president.has(PERMISSIONS.ROLES_MANAGE), true);
  assert.equal(president.has(PERMISSIONS.EVENTS_MANAGE), false);
  assert.equal(president.has(PERMISSIONS.CONTACTS_READ), false);
});

test('role permissions are resolved from the assigned custom roles', async () => {
  const db = makeDb();
  db.roles.set('events-editor', { key: 'events-editor', permissions: [PERMISSIONS.EVENTS_MANAGE, 'developer.full'] });
  const permissions = await getEffectivePermissions(db, { roleKeys: ['events-editor'], permissions: [] });
  assert.equal(permissions.has(PERMISSIONS.EVENTS_MANAGE), true);
  assert.equal(permissions.has('developer.full'), false);
});

test('permission middleware rejects unauthenticated and unauthorized users, and allows grants', async () => {
  const db = makeDb();
  const middleware = createRequirePermission(db, PERMISSIONS.EVENTS_MANAGE);
  let error;
  await middleware({ user: null }, makeResponse(), (nextError) => { error = nextError; });
  assert.equal(error.statusCode, 401);
  error = undefined;
  await middleware({ user: { roleKeys: ['member'], permissions: [] } }, makeResponse(), (nextError) => { error = nextError; });
  assert.equal(error.statusCode, 403);
  let nextCalled = false;
  await middleware({ user: { roleKeys: ['developer'], permissions: [] } }, makeResponse(), () => { nextCalled = true; });
  assert.equal(nextCalled, true);
});

test('President can create a bounded custom role but cannot create a Developer role or grant unlisted permissions', async () => {
  const db = makeDb();
  const { createRole } = createRoleHandlers(db);
  const president = { params: {}, user: { roleKeys: ['president'] }, body: { key: 'event-editor', name: 'Event Editor', permissions: [PERMISSIONS.EVENTS_MANAGE] } };
  const created = await invoke(createRole, president);
  assert.equal(created.statusCode, 201);
  assert.equal(db.roles.get('event-editor').permissions[0], PERMISSIONS.EVENTS_MANAGE);

  await assert.rejects(invoke(createRole, { ...president, body: { key: 'developer', name: 'Developer', permissions: [] } }), { statusCode: 400 });
  await assert.rejects(invoke(createRole, { ...president, body: { key: 'root-access', name: 'Root Access', permissions: ['developer.full'] } }), { statusCode: 400 });
  await assert.rejects(invoke(createRole, { ...president, body: { key: 'role-admin', name: 'Role Admin', permissions: [PERMISSIONS.ROLES_MANAGE] } }), { statusCode: 400 });
});

test('role administration lists role and user data without password hashes', async () => {
  const db = makeDb();
  db.roles.set('events-editor', { id: 'role-id', key: 'events-editor', name: 'Event Editor', permissions: [PERMISSIONS.EVENTS_MANAGE], system: false, createdAt: new Date(), updatedAt: new Date() });
  const handlers = createRoleHandlers(db);
  const roleList = await invoke(handlers.listRoles, {});
  assert.equal(roleList.body[0].key, 'events-editor');
  assert.equal(roleList.body[0]._id, 'role-id');
  const userList = await invoke(handlers.listUsers, {});
  assert.equal(userList.body[0].email, 'member@example.com');
  assert.equal('passwordHash' in userList.body[0], false);
});

test('a President cannot grant Developer access to another user', async () => {
  const db = makeDb();
  const { changeUserRoles } = createRoleHandlers(db);
  await assert.rejects(invoke(changeUserRoles, {
    params: { userId: id },
    user: { roleKeys: ['president'] },
    body: { grant: ['developer'], revoke: [] },
  }), { statusCode: 403 });
  assert.deepEqual(db.users.get(id).roleKeys, ['member']);
});

test('only a Developer may grant Developer access', async () => {
  const db = makeDb();
  const { changeUserRoles } = createRoleHandlers(db);
  await invoke(changeUserRoles, {
    params: { userId: id },
    user: { roleKeys: ['developer'] },
    body: { grant: ['developer'], revoke: [] },
  });
  assert.deepEqual(db.users.get(id).roleKeys, ['member', 'developer']);
});

test('President can grant and revoke only catalogued permissions on a member', async () => {
  const db = makeDb();
  const { changeUserPermissions } = createRoleHandlers(db);
  const actor = { roleKeys: ['president'] };
  await invoke(changeUserPermissions, { params: { userId: id }, user: actor, body: { grant: [PERMISSIONS.MEMBERS_MANAGE], revoke: [] } });
  assert.equal(await userHasPermission(db, db.users.get(id), PERMISSIONS.MEMBERS_MANAGE), true);
  await invoke(changeUserPermissions, { params: { userId: id }, user: actor, body: { grant: [], revoke: [PERMISSIONS.MEMBERS_MANAGE] } });
  assert.equal(await userHasPermission(db, db.users.get(id), PERMISSIONS.MEMBERS_MANAGE), false);
});

test('President cannot self-grant permissions, promote another President, or alter a privileged account', async () => {
  const db = makeDb();
  const otherId = 'aaaaaaaaaaaaaaaaaaaaaaaa';
  db.users.set(otherId, { id: otherId, roleKeys: ['president'], permissions: [], status: 'ACTIVE' });
  const { changeUserPermissions, changeUserRoles } = createRoleHandlers(db);
  const president = { id, roleKeys: ['president'] };

  await assert.rejects(invoke(changeUserPermissions, {
    params: { userId: id }, user: president, body: { grant: [PERMISSIONS.EVENTS_MANAGE], revoke: [] },
  }), { statusCode: 403 });
  await assert.rejects(invoke(changeUserRoles, {
    params: { userId: otherId }, user: president, body: { grant: ['president'], revoke: [] },
  }), { statusCode: 403 });
  await assert.rejects(invoke(changeUserRoles, {
    params: { userId: otherId }, user: president, body: { grant: [], revoke: ['president'] },
  }), { statusCode: 403 });
});

test('President cannot change a custom role assigned to a privileged account, but may manage member roles', async () => {
  const db = makeDb();
  const presidentId = 'bbbbbbbbbbbbbbbbbbbbbbbb';
  const roleKey = 'events-editor';
  const memberRoleKey = 'contact-reader';
  db.roles.set(roleKey, { id: 'role-id', key: roleKey, name: 'Events Editor', permissions: [], system: false });
  db.roles.set(memberRoleKey, { id: 'member-role-id', key: memberRoleKey, name: 'Contact Reader', permissions: [], system: false });
  db.users.set(id, { ...db.users.get(id), roleKeys: ['member', memberRoleKey] });
  db.users.set(presidentId, { id: presidentId, roleKeys: ['president', roleKey], permissions: [] });
  const { updateRole } = createRoleHandlers(db);

  await assert.rejects(invoke(updateRole, {
    params: { roleKey },
    user: { id: presidentId, roleKeys: ['president', roleKey] },
    body: { permissions: [PERMISSIONS.EVENTS_MANAGE] },
  }), { statusCode: 403 });
  assert.deepEqual(db.roles.get(roleKey).permissions, []);

  const updated = await invoke(updateRole, {
    params: { roleKey: memberRoleKey },
    user: { id: 'cccccccccccccccccccccccc', roleKeys: ['president'] },
    body: { permissions: [PERMISSIONS.EVENTS_MANAGE] },
  });
  assert.deepEqual(updated.body.permissions, [PERMISSIONS.EVENTS_MANAGE]);
});

test('contact inbox permission is denied unless explicitly granted or Developer', async () => {
  const db = makeDb();
  assert.equal(await userHasPermission(db, { roleKeys: ['president'], permissions: [] }, PERMISSIONS.CONTACTS_READ), false);
  assert.equal(await userHasPermission(db, { roleKeys: ['member'], permissions: [PERMISSIONS.CONTACTS_READ] }, PERMISSIONS.CONTACTS_READ), true);
  assert.equal(await userHasPermission(db, { roleKeys: ['developer'], permissions: [] }, PERMISSIONS.CONTACTS_READ), true);
});

test('member profile updates use the authenticated user id and reject privilege fields', async () => {
  const db = makeDb();
  const { updateProfile } = createProfileHandlers(db);
  const updated = await invoke(updateProfile, {
    user: { id, roleKeys: ['member'] },
    body: { displayName: '  New Name  ', profileImageUrl: 'https://images.example/avatar.png' },
  });
  assert.equal(updated.body.user.displayName, 'New Name');
  assert.equal(db.users.get(id).displayName, 'New Name');

  await assert.rejects(invoke(updateProfile, { user: { id }, body: { userId: 'another-user', roleKeys: ['developer'] } }), { statusCode: 400 });
  assert.equal(db.users.get(id).roleKeys[0], 'member');
});

test('member admin controller permits only declared member fields', async () => {
  const db = makeDb();
  let created;
  db.member = {
    async findMany() { return created ? [created] : []; },
    async create({ data }) { created = { id, ...data }; return created; },
    async update({ where, data }) { return { ...created, ...data, id: where.id }; },
    async delete({ where }) { return { id: where.id }; },
  };
  const { createMember, updateMember, deleteMember } = createMemberAdminHandlers(db);
  const result = await invoke(createMember, { body: { name: ' New Member ', email: 'USER@EXAMPLE.COM' } });
  assert.equal(result.statusCode, 201);
  assert.equal(result.body.name, 'New Member');
  assert.equal(created.email, 'user@example.com');
  await assert.rejects(invoke(createMember, { body: { name: 'Member', userId: id } }), { statusCode: 400 });
  const updated = await invoke(updateMember, { params: { id }, body: { active: false } });
  assert.equal(updated.body.active, false);
  const deleted = await invoke(deleteMember, { params: { id } });
  assert.equal(deleted.statusCode, 204);
});

test('event CRUD persists through the database client and public reads include only published events', async () => {
  const db = makeDb();
  const handlers = createEventHandlers(db);
  const draft = await invoke(handlers.createEvent, {
    user: { roleKeys: ['secretary'], permissions: [PERMISSIONS.EVENTS_MANAGE] },
    body: { title: 'Planning Session', startsAt: '2030-05-10T12:00:00.000Z', status: 'DRAFT' },
  });
  assert.equal(draft.statusCode, 201);
  assert.equal(db.events.size, 1);
  assert.equal(draft.body.status, 'DRAFT');

  db.events.set('aaaaaaaaaaaaaaaaaaaaaaaa', { id: 'aaaaaaaaaaaaaaaaaaaaaaaa', title: 'Public', startsAt: new Date('2030-01-01T00:00:00.000Z'), status: 'PUBLISHED', version: 0 });
  const publicList = await invoke(handlers.listEvents, { user: null });
  assert.deepEqual(publicList.body.map((event) => event.title), ['Public']);

  const updated = await invoke(handlers.updateEvent, {
    params: { id: draft.body._id },
    body: { status: 'PUBLISHED' },
  });
  assert.equal(updated.body.status, 'PUBLISHED');
  const deleted = await invoke(handlers.deleteEvent, { params: { id: draft.body._id } });
  assert.equal(deleted.statusCode, 204);
  assert.equal(db.events.has(draft.body._id), false);
});

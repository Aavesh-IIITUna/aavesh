import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import { prisma } from '../src/config/prisma.js';
import { env } from '../src/config/env.js';
import { createApp } from '../src/app.js';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

const enabled = process.env.RUN_PRISMA_INTEGRATION === '1';
const rollbackMarker = 'ROLLBACK_PRISMA_INTEGRATION_FIXTURES';

const databaseName = (value) => decodeURIComponent(new URL(value).pathname.split('/').filter(Boolean)[0] ?? '');

const request = async (baseUrl, path, { method = 'GET', cookie, body } = {}) => {
  const headers = {};
  if (cookie) headers.cookie = cookie;
  if (body !== undefined) headers['content-type'] = 'application/json';
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const setCookie = response.headers.get('set-cookie');
  const cookieValue = setCookie?.split(';', 1)[0];
  const text = await response.text();
  let payload;
  if (text) {
    try { payload = JSON.parse(text); } catch { payload = text; }
  }
  return { status: response.status, payload, cookie: cookieValue };
};

const jsonRequest = (method, body, cookie) => ({ method, body, cookie });

test('Prisma API integration against aavesh_prisma_dev (transaction rolled back)', { skip: !enabled }, async () => {
  assert.equal(databaseName(process.env.DATABASE_URL), 'aavesh_prisma_dev');
  assert.equal(databaseName(env.mongoUri), 'aavesh_prisma_dev');

  const suffix = `${Date.now()}-${randomBytes(4).toString('hex')}`;
  const emailPrefix = `codex-it-${suffix}-`;
  const roleKey = `it-${suffix.replaceAll('-', '').slice(-20)}`;
  const roleKeyPrefix = roleKey;
  const eventTitle = `Codex Integration Event ${suffix}`;
  let server;
  let mongooseConnected = false;

  try {
    await prisma.$transaction(async (tx) => {
      const app = createApp({ database: tx });
      server = app.listen(0, '127.0.0.1');
      await new Promise((resolve, reject) => {
        server.once('listening', resolve);
        server.once('error', reject);
      });
      const baseUrl = `http://127.0.0.1:${server.address().port}`;

      try {
        await mongoose.connect(env.mongoUri);
        mongooseConnected = true;

        const anonymousProfile = await request(baseUrl, '/api/me');
        assert.equal(anonymousProfile.status, 401);

        const registered = await request(baseUrl, '/api/auth/register', jsonRequest('POST', {
          email: `${emailPrefix}developer@example.invalid`,
          displayName: 'Integration Developer',
          password: 'Integration-password-123',
        }));
        assert.equal(registered.status, 201);
        assert.ok(registered.cookie?.startsWith('aavesh_session='));
        assert.deepEqual(registered.payload.user.roleKeys, ['member']);
        assert.deepEqual(registered.payload.user.permissions, []);
        assert.equal('passwordHash' in registered.payload.user, false);
        assert.equal('token' in registered.payload, false);

        const developerId = registered.payload.user.id;
        await tx.user.update({ where: { id: developerId }, data: { roleKeys: ['developer'] } });

        const login = await request(baseUrl, '/api/auth/login', jsonRequest('POST', {
          email: `${emailPrefix}DEVELOPER@example.invalid`,
          password: 'Integration-password-123',
        }));
        assert.equal(login.status, 200);
        assert.ok(login.cookie?.startsWith('aavesh_session='));
        assert.equal('passwordHash' in login.payload.user, false);

        const wrongPassword = await request(baseUrl, '/api/auth/login', jsonRequest('POST', {
          email: `${emailPrefix}developer@example.invalid`,
          password: 'incorrect-password',
        }));
        const unknownEmail = await request(baseUrl, '/api/auth/login', jsonRequest('POST', {
          email: `${emailPrefix}unknown@example.invalid`,
          password: 'incorrect-password',
        }));
        assert.equal(wrongPassword.status, 401);
        assert.equal(unknownEmail.status, 401);
        assert.equal(wrongPassword.payload.error, unknownEmail.payload.error);

        const profile = await request(baseUrl, '/api/me', { cookie: login.cookie });
        assert.equal(profile.status, 200);
        assert.equal(profile.payload.user.id, developerId);
        assert.deepEqual(profile.payload.user.roleKeys, ['developer']);
        assert.deepEqual(profile.payload.user.permissions, ['*']);
        const profileUpdate = await request(baseUrl, '/api/me/profile', jsonRequest('PATCH', {
          displayName: 'Updated Integration Developer',
          profileImageUrl: 'https://example.invalid/avatar.png',
        }, login.cookie));
        assert.equal(profileUpdate.status, 200);
        assert.equal(profileUpdate.payload.user.displayName, 'Updated Integration Developer');
        assert.equal(profileUpdate.payload.user.profileImageUrl, 'https://example.invalid/avatar.png');
        const forbiddenProfileFields = await request(baseUrl, '/api/me/profile', jsonRequest('PATCH', {
          userId: 'another-user',
          roleKeys: ['developer'],
        }, login.cookie));
        assert.equal(forbiddenProfileFields.status, 400);

        const presidentRegistration = await request(baseUrl, '/api/auth/register', jsonRequest('POST', {
          email: `${emailPrefix}president@example.invalid`,
          displayName: 'Integration President',
          password: 'Integration-password-123',
        }));
        assert.equal(presidentRegistration.status, 201);
        const presidentId = presidentRegistration.payload.user.id;
        const assignedPresident = await request(baseUrl, `/api/users/${presidentId}/roles`, jsonRequest('PATCH', {
          grant: ['president'], revoke: [],
        }, login.cookie));
        assert.equal(assignedPresident.status, 200);

        const secretaryRegistration = await request(baseUrl, '/api/auth/register', jsonRequest('POST', {
          email: `${emailPrefix}secretary@example.invalid`,
          displayName: 'Integration Secretary',
          password: 'Integration-password-123',
        }));
        assert.equal(secretaryRegistration.status, 201);
        const secretaryId = secretaryRegistration.payload.user.id;
        const secretaryCookie = secretaryRegistration.cookie;

        const deniedEventBeforeGrant = await request(baseUrl, '/api/events', jsonRequest('POST', {
          title: eventTitle,
          startsAt: '2030-05-10T12:00:00.000Z',
        }, secretaryCookie));
        assert.equal(deniedEventBeforeGrant.status, 403);

        const createdRole = await request(baseUrl, '/api/roles', jsonRequest('POST', {
          key: roleKey,
          name: 'Integration Event and Member Manager',
          permissions: ['events.manage'],
        }, presidentRegistration.cookie));
        assert.equal(createdRole.status, 201);

        const rejectedPrivilegedRole = await request(baseUrl, '/api/roles', jsonRequest('POST', {
          key: `${roleKey}-bad`,
          name: 'Integration Privileged Role',
          permissions: ['roles.manage'],
        }, presidentRegistration.cookie));
        assert.equal(rejectedPrivilegedRole.status, 400);

        const rejectedPresidentSelfGrant = await request(baseUrl, `/api/users/${presidentId}/permissions`, jsonRequest('PATCH', {
          grant: ['events.manage'], revoke: [],
        }, presidentRegistration.cookie));
        assert.equal(rejectedPresidentSelfGrant.status, 403);

        const rejectedDeveloperGrant = await request(baseUrl, `/api/users/${secretaryId}/roles`, jsonRequest('PATCH', {
          grant: ['developer'], revoke: [],
        }, presidentRegistration.cookie));
        assert.equal(rejectedDeveloperGrant.status, 403);

        const assignedDelegatedRole = await request(baseUrl, `/api/users/${secretaryId}/roles`, jsonRequest('PATCH', {
          grant: [roleKey, 'secretary'], revoke: [],
        }, presidentRegistration.cookie));
        assert.equal(assignedDelegatedRole.status, 200);
        const secretaryProfile = await request(baseUrl, '/api/me', { cookie: secretaryCookie });
        assert.deepEqual(secretaryProfile.payload.user.roleKeys.sort(), [roleKey, 'member', 'secretary'].sort());
        assert.deepEqual(secretaryProfile.payload.user.permissions.sort(), ['events.manage'].sort());

        const createEvent = await request(baseUrl, '/api/events', jsonRequest('POST', {
          title: eventTitle,
          description: 'Disposable transaction fixture',
          startsAt: '2030-05-10T12:00:00.000Z',
          status: 'DRAFT',
        }, secretaryCookie));
        assert.equal(createEvent.status, 201);
        assert.ok(createEvent.payload._id);
        assert.equal(createEvent.payload.status, 'DRAFT');

        const updateRole = await request(baseUrl, `/api/roles/${roleKey}`, jsonRequest('PATCH', {
          permissions: ['events.manage', 'members.manage'],
        }, presidentRegistration.cookie));
        assert.equal(updateRole.status, 200);

        const createMember = await request(baseUrl, '/api/members', jsonRequest('POST', {
          name: `Integration Member ${suffix}`,
          email: `${emailPrefix}member@example.invalid`,
          joinedYear: 2026,
        }, secretaryCookie));
        assert.equal(createMember.status, 201);
        const memberId = createMember.payload._id;
        const updateMember = await request(baseUrl, `/api/members/${memberId}`, jsonRequest('PATCH', {
          track: 'Integration Test',
        }, secretaryCookie));
        assert.equal(updateMember.status, 200);
        assert.equal(updateMember.payload.track, 'Integration Test');
        const deleteMember = await request(baseUrl, `/api/members/${memberId}`, { method: 'DELETE', cookie: secretaryCookie });
        assert.equal(deleteMember.status, 204);

        const updateEvent = await request(baseUrl, `/api/events/${createEvent.payload._id}`, jsonRequest('PATCH', {
          status: 'PUBLISHED',
        }, secretaryCookie));
        assert.equal(updateEvent.status, 200);
        assert.equal(updateEvent.payload.status, 'PUBLISHED');
        assert.equal(updateEvent.payload.__v, 1);
        const publicEvents = await request(baseUrl, '/api/events');
        assert.equal(publicEvents.status, 200);
        assert.ok(publicEvents.payload.some((event) => event._id === createEvent.payload._id));
        const deleteEvent = await request(baseUrl, `/api/events/${createEvent.payload._id}`, { method: 'DELETE', cookie: secretaryCookie });
        assert.equal(deleteEvent.status, 204);

        const anonymousInbox = await request(baseUrl, '/api/contact');
        assert.equal(anonymousInbox.status, 401);
        const memberInbox = await request(baseUrl, '/api/contact', { cookie: secretaryCookie });
        assert.equal(memberInbox.status, 403);
        const developerInbox = await request(baseUrl, '/api/contact', { cookie: login.cookie });
        assert.equal(developerInbox.status, 200);
        assert.ok(Array.isArray(developerInbox.payload));

        const tracks = await request(baseUrl, '/api/society/tracks');
        const members = await request(baseUrl, '/api/members');
        assert.equal(tracks.status, 200);
        assert.ok(Array.isArray(tracks.payload));
        assert.equal(members.status, 200);
        assert.ok(Array.isArray(members.payload));

        const logout = await request(baseUrl, '/api/auth/logout', { method: 'POST', cookie: login.cookie });
        assert.equal(logout.status, 204);
        const revokedSession = await request(baseUrl, '/api/me', { cookie: login.cookie });
        assert.equal(revokedSession.status, 401);

        // Exercise the indirect privilege escalation guard inside the same disposable transaction.
        const privilegedRoleKey = `${roleKey}-priv`;
        await tx.role.create({ data: { key: privilegedRoleKey, name: 'Integration President Role', permissions: [], system: false } });
        await tx.user.update({ where: { id: presidentId }, data: { roleKeys: ['president', privilegedRoleKey] } });
        const deniedPrivilegedRoleEdit = await request(baseUrl, `/api/roles/${privilegedRoleKey}`, jsonRequest('PATCH', {
          permissions: ['events.manage'],
        }, presidentRegistration.cookie));
        assert.equal(deniedPrivilegedRoleEdit.status, 403);
      } finally {
        if (server?.listening) await new Promise((resolve) => server.close(resolve));
        if (mongooseConnected) await mongoose.disconnect();
      }

      throw new Error(rollbackMarker);
    }, { maxWait: 10_000, timeout: 120_000 });
  } catch (error) {
    if (error.message !== rollbackMarker) throw error;
  }

  const remainingUsers = await prisma.user.count({ where: { email: { startsWith: emailPrefix } } });
  const remainingRoles = await prisma.role.count({ where: { key: { startsWith: roleKeyPrefix } } });
  const remainingEvents = await prisma.event.count({ where: { title: eventTitle } });
  const remainingMembers = await prisma.member.count({ where: { name: `Integration Member ${suffix}` } });
  assert.equal(remainingUsers, 0);
  assert.equal(remainingRoles, 0);
  assert.equal(remainingEvents, 0);
  assert.equal(remainingMembers, 0);
});

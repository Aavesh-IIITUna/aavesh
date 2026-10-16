import test from 'node:test';
import assert from 'node:assert/strict';
import { assertDevelopmentDatabase, normalizeEmail, provisionFirstDeveloper } from '../src/scripts/provision-first-developer.js';

const databaseUrl = 'mongodb://127.0.0.1:27017/aavesh_prisma_dev';

test('first Developer provisioning is restricted to the development database', () => {
  assert.doesNotThrow(() => assertDevelopmentDatabase(databaseUrl));
  assert.throws(() => assertDevelopmentDatabase('mongodb://127.0.0.1:27017/aavesh'), /must target aavesh_prisma_dev/);
  assert.equal(normalizeEmail('  Person@Example.com '), 'person@example.com');
});

test('provisioning adds Developer to an existing account without removing its roles', async () => {
  let updateData;
  const user = { id: 'u1', status: 'ACTIVE', roleKeys: ['member', 'secretary'] };
  const claims = new Map();
  const db = {
    user: {
      async findUnique() { return user; },
      async findFirst() { return null; },
      async update({ data }) { updateData = data; return { ...user, ...data }; },
    },
    async $runCommandRaw(command) {
      assert.equal(command.findAndModify, 'developerprovisioningclaims');
      const claim = claims.get(command.query._id) ?? { _id: command.query._id, ...command.update.$setOnInsert };
      claims.set(command.query._id, claim);
      return { value: claim };
    },
  };

  const result = await provisionFirstDeveloper(db, 'person@example.com');
  assert.deepEqual(updateData.roleKeys, ['member', 'secretary', 'developer']);
  assert.deepEqual(result.roleKeys, ['member', 'secretary', 'developer']);
});

test('provisioning refuses missing accounts and any already-provisioned Developer', async () => {
  const makeDb = ({ user, developer }) => ({
    user: {
      async findUnique() { return user; },
      async findFirst() { return developer ? { id: 'existing-developer' } : null; },
      async update() { assert.fail('must not update'); },
    },
    async $runCommandRaw() {
      assert.fail('must not acquire a claim');
    },
  });

  await assert.rejects(provisionFirstDeveloper(makeDb({ user: null, developer: false }), 'missing@example.com'), /No registered account/);
  await assert.rejects(provisionFirstDeveloper(makeDb({ user: { id: 'u2', status: 'ACTIVE', roleKeys: ['member'] }, developer: true }), 'person@example.com'), /already provisioned/);
});

test('concurrent provisioning attempts cannot promote two different accounts', async () => {
  const users = new Map([
    ['one@example.com', { id: 'u1', status: 'ACTIVE', roleKeys: ['member'] }],
    ['two@example.com', { id: 'u2', status: 'ACTIVE', roleKeys: ['member'] }],
  ]);
  const claims = new Map();
  const db = {
    user: {
      async findUnique({ where }) { return users.get(where.email) ?? null; },
      async findFirst() { return [...users.values()].find(({ roleKeys }) => roleKeys.includes('developer')) ?? null; },
      async update({ where, data }) {
        const user = [...users.values()].find(({ id }) => id === where.id);
        user.roleKeys = data.roleKeys;
        return user;
      },
    },
    async $runCommandRaw(command) {
      assert.equal(command.findAndModify, 'developerprovisioningclaims');
      // This synchronous upsert models MongoDB's atomic findAndModify on the unique _id.
      const claim = claims.get(command.query._id) ?? { _id: command.query._id, ...command.update.$setOnInsert };
      claims.set(command.query._id, claim);
      return { value: claim };
    },
  };

  const results = await Promise.allSettled([
    provisionFirstDeveloper(db, 'one@example.com'),
    provisionFirstDeveloper(db, 'two@example.com'),
  ]);

  assert.equal(results.filter(({ status }) => status === 'fulfilled').length, 1);
  assert.equal(results.filter(({ status }) => status === 'rejected').length, 1);
  const developers = [...users.values()].filter(({ roleKeys }) => roleKeys.includes('developer'));
  assert.equal(developers.length, 1);
  assert.equal(developers[0].id, claims.get('first-developer').ownerUserId);
});

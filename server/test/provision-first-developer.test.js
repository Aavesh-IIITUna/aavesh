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
  const db = {
    async $transaction(callback) {
      return callback({
        user: {
          async findUnique() { return user; },
          async findFirst() { return null; },
          async update({ data }) { updateData = data; return { ...user, ...data }; },
        },
      });
    },
  };

  const result = await provisionFirstDeveloper(db, 'person@example.com');
  assert.deepEqual(updateData.roleKeys, ['member', 'secretary', 'developer']);
  assert.deepEqual(result.roleKeys, ['member', 'secretary', 'developer']);
});

test('provisioning refuses missing accounts and any already-provisioned Developer', async () => {
  const makeDb = ({ user, developer }) => ({
    async $transaction(callback) {
      return callback({ user: {
        async findUnique() { return user; },
        async findFirst() { return developer ? { id: 'existing-developer' } : null; },
        async update() { assert.fail('must not update'); },
      } });
    },
  });

  await assert.rejects(provisionFirstDeveloper(makeDb({ user: null, developer: false }), 'missing@example.com'), /No registered account/);
  await assert.rejects(provisionFirstDeveloper(makeDb({ user: { id: 'u2', status: 'ACTIVE', roleKeys: ['member'] }, developer: true }), 'person@example.com'), /already provisioned/);
});

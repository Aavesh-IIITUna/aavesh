import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });

const DEVELOPMENT_DATABASE = 'aavesh_prisma_dev';
const CLAIM_COLLECTION = 'developerprovisioningclaims';
const CLAIM_ID = 'first-developer';

export const normalizeEmail = (value) => {
  if (typeof value !== 'string') throw new Error('Provide an account email with --email.');
  const email = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    throw new Error('Provide a valid account email with --email.');
  }
  return email;
};

export const assertDevelopmentDatabase = (databaseUrl) => {
  let databaseName;
  try {
    databaseName = decodeURIComponent(new URL(databaseUrl).pathname.split('/').filter(Boolean)[0] ?? '');
  } catch {
    throw new Error('DATABASE_URL must be a valid MongoDB URL for aavesh_prisma_dev.');
  }
  if (!/^mongodb(?:\+srv)?:$/.test(new URL(databaseUrl).protocol) || databaseName !== DEVELOPMENT_DATABASE) {
    throw new Error('Refusing to provision: DATABASE_URL must target aavesh_prisma_dev.');
  }
};

const acquireDeveloperClaim = async (db, userId) => {
  const command = {
    findAndModify: CLAIM_COLLECTION,
    query: { _id: CLAIM_ID },
    update: { $setOnInsert: { ownerUserId: userId } },
    upsert: true,
    new: true,
  };
  let result;
  try {
    result = await db.$runCommandRaw(command);
  } catch {
    // Concurrent upserts on the fixed _id may report a duplicate-key race.
    // Retry against the now-existing document; $setOnInsert will leave it intact.
    result = await db.$runCommandRaw(command);
  }

  const claim = result?.value;
  if (claim?.ownerUserId === userId) return;
  if (claim) throw new Error('First Developer provisioning is already claimed by another account.');
  throw new Error('Could not acquire the first Developer provisioning claim. No account was changed.');
};

export const provisionFirstDeveloper = async (db, email) => {
  const user = await db.user.findUnique({ where: { email } });
  if (!user) throw new Error('No registered account matches that email. Register the account first.');
  if (user.status !== 'ACTIVE') throw new Error('The account is not active; no changes were made.');

  const existingDeveloper = await db.user.findFirst({ where: { roleKeys: { has: 'developer' } }, select: { id: true } });
  if (existingDeveloper) throw new Error('A Developer account is already provisioned; no changes were made.');

  // MongoDB's built-in unique _id index makes this insert an atomic singleton
  // claim. It intentionally sits outside a Prisma transaction: a successful
  // claim remains recoverable by this same account if the process exits before
  // promotion, and another account can never acquire a second claim.
  await acquireDeveloperClaim(db, user.id);

  const currentUser = await db.user.findUnique({ where: { email } });
  if (!currentUser || currentUser.id !== user.id) throw new Error('The account changed while provisioning; no promotion was made.');
  if (currentUser.status !== 'ACTIVE') throw new Error('The account is not active; no changes were made.');

  const developerAfterClaim = await db.user.findFirst({ where: { roleKeys: { has: 'developer' } }, select: { id: true } });
  if (developerAfterClaim) throw new Error('A Developer account is already provisioned; no changes were made.');

  const roleKeys = [...new Set([...(currentUser.roleKeys ?? []), 'developer'])];
  return db.user.update({ where: { id: currentUser.id }, data: { roleKeys } });
};

const main = async () => {
  const emailArgIndex = process.argv.indexOf('--email');
  const email = normalizeEmail(emailArgIndex >= 0 ? process.argv[emailArgIndex + 1] : undefined);
  assertDevelopmentDatabase(process.env.DATABASE_URL);
  if (!stdin.isTTY || !stdout.isTTY) throw new Error('Run this command in an interactive terminal; confirmation is required.');

  const rl = createInterface({ input: stdin, output: stdout });
  try {
    const confirmation = await rl.question(`Type ${email} to provision the first Developer in ${DEVELOPMENT_DATABASE}: `);
    if (confirmation.trim().toLowerCase() !== email) throw new Error('Confirmation did not match; no changes were made.');
  } finally {
    rl.close();
  }

  const { prisma } = await import('../config/prisma.js');
  try {
    await provisionFirstDeveloper(prisma, email);
    stdout.write(`First Developer provisioned for ${DEVELOPMENT_DATABASE}.\n`);
  } finally {
    await prisma.$disconnect();
  }
};

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : '';
if (import.meta.url === invokedPath) {
  main().catch((error) => {
    // Only intentionally safe validation messages are printed; database URLs and credentials are never logged.
    const safeMessages = new Set([
      'Provide an account email with --email.',
      'Provide a valid account email with --email.',
      'DATABASE_URL must be a valid MongoDB URL for aavesh_prisma_dev.',
      'Refusing to provision: DATABASE_URL must target aavesh_prisma_dev.',
      'Run this command in an interactive terminal; confirmation is required.',
      'No registered account matches that email. Register the account first.',
      'The account is not active; no changes were made.',
      'The account changed while provisioning; no promotion was made.',
      'A Developer account is already provisioned; no changes were made.',
      'First Developer provisioning is already claimed by another account.',
      'Could not acquire the first Developer provisioning claim. No account was changed.',
      'Confirmation did not match; no changes were made.',
    ]);
    stdout.write(`${safeMessages.has(error.message) ? error.message : 'Provisioning failed; details were withheld to protect connection credentials.'}\n`);
    process.exitCode = 1;
  });
}

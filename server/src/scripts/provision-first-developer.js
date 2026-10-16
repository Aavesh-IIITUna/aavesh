import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });

const DEVELOPMENT_DATABASE = 'aavesh_prisma_dev';

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

export const provisionFirstDeveloper = async (db, email) => db.$transaction(async (tx) => {
  const user = await tx.user.findUnique({ where: { email } });
  if (!user) throw new Error('No registered account matches that email. Register the account first.');
  if (user.status !== 'ACTIVE') throw new Error('The account is not active; no changes were made.');

  const existingDeveloper = await tx.user.findFirst({ where: { roleKeys: { has: 'developer' } }, select: { id: true } });
  if (existingDeveloper) throw new Error('A Developer account is already provisioned; no changes were made.');

  const roleKeys = [...new Set([...(user.roleKeys ?? []), 'developer'])];
  return tx.user.update({ where: { id: user.id }, data: { roleKeys } });
});

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
      'A Developer account is already provisioned; no changes were made.',
      'Confirmation did not match; no changes were made.',
    ]);
    stdout.write(`${safeMessages.has(error.message) ? error.message : 'Provisioning failed; details were withheld to protect connection credentials.'}\n`);
    process.exitCode = 1;
  });
}

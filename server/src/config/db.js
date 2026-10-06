import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB() {
  mongoose.set('strictQuery', true);

  const connection = await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log(`[mongo] connected → ${connection.connection.host}/${connection.connection.name}`);

  return connection.connection;
}

export async function disconnectDB() {
  await mongoose.connection.close();
}
import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

async function bootstrap() {
  const app = createApp();
  app.listen(env.port, () => {
    console.log(`[api] AAVESH server listening on http://localhost:${env.port} (${env.nodeEnv})`);
  });

  try {
    await connectDB();
  } catch (err) {
    console.error('[mongo] connection failed:', err.message);
    console.error('[mongo] set MONGO_URI in server/.env to point at a running MongoDB instance');
  }
}

process.on('unhandledRejection', (err) => {
  console.error('[fatal] unhandled rejection:', err);
  process.exit(1);
});

bootstrap();
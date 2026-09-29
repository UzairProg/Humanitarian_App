import http from 'http';
import mongoose from 'mongoose';
import { app } from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { runDevSeed } from './database/seeds/dev.seed';

async function bootstrap() {
  try {
    // 1. Establish MongoDB Connection
    await connectDatabase();

    // 2. Auto-seed in dev / test if database is fresh
    if (env.NODE_ENV !== 'production') {
      try {
        await runDevSeed(mongoose.connection);
      } catch (seedErr: any) {
        console.warn(`[Bootstrap] Auto-seed note: ${seedErr.message}`);
      }
    }

    // 3. Start Express HTTP Server
    const server = http.createServer(app);

    server.listen(env.APP_PORT, () => {
      console.log('====================================================');
      console.log(` Al-Husseiniya MERN Backend API Started`);
      console.log(` Architecture : Express.js + Node.js + MongoDB (STRICT MERN)`);
      console.log(` Environment  : ${env.NODE_ENV}`);
      console.log(` Listening on : http://localhost:${env.APP_PORT}`);
      console.log(` API Endpoint : http://localhost:${env.APP_PORT}/${env.API_PREFIX}`);
      console.log(` Health Check : http://localhost:${env.APP_PORT}/health`);
      console.log('====================================================');
    });

    // 4. Graceful Shutdown Handlers
    const shutdown = async (signal: string) => {
      console.log(`[Server] Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDatabase();
        console.log('[Server] HTTP server closed. Process exiting.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error: any) {
    console.error('[Bootstrap] Fatal startup error:', error.message);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  bootstrap();
}

export { bootstrap };

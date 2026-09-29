import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../app';
import { runDevSeed } from '../database/seeds/dev.seed';
import { Application } from 'express';

let mongoServer: MongoMemoryServer;
let testApp: Application;

export async function setupTestEnvironment(): Promise<{ app: Application; uri: string }> {
  mongoServer = await MongoMemoryServer.create({
    instance: { dbName: 'al_husseiniya_test' },
  });
  const uri = mongoServer.getUri();

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(uri);
  await runDevSeed(mongoose.connection);

  testApp = createApp();
  return { app: testApp, uri };
}

export async function teardownTestEnvironment(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
}

import mongoose from 'mongoose';
import { env } from './env';

let memoryServerInstance: any = null;

export async function getMongoUri(): Promise<string> {
  if (env.USE_MEMORY_DB) {
    if (!memoryServerInstance) {
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        memoryServerInstance = await MongoMemoryServer.create({
          instance: {
            dbName: env.MONGODB_DATABASE,
          },
        });
        const uri = memoryServerInstance.getUri();
        console.log(`[Database] In-memory MongoDB Server started at: ${uri}`);
        return uri;
      } catch (err: any) {
        console.warn(
          `[Database] Could not start mongodb-memory-server: ${err.message}. Falling back to configured URI.`,
        );
      }
    } else {
      return memoryServerInstance.getUri();
    }
  }

  return env.MONGODB_URI;
}

export async function connectDatabase(): Promise<typeof mongoose> {
  const uri = await getMongoUri();
  console.log(`[Database] Connecting to MongoDB: ${uri.replace(/\/\/.*@/, '//***:***@')}`);
  const connection = await mongoose.connect(uri, {
    dbName: env.MONGODB_DATABASE,
  });
  console.log('[Database] MongoDB connection established successfully.');
  return connection;
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
    memoryServerInstance = null;
  }
  console.log('[Database] MongoDB connection disconnected.');
}

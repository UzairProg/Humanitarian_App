import mongoose from 'mongoose';
import { getMongoUri, stopMemoryServer } from '../database.module';
import { runDevSeed } from '../seeds/dev.seed';

async function main() {
  console.log('[SeedRunner] Connecting to MongoDB...');
  try {
    const uri = await getMongoUri();
    await mongoose.connect(uri);
    console.log(`[SeedRunner] Connected to MongoDB at: ${uri}`);
    await runDevSeed(mongoose.connection);
    await mongoose.disconnect();
    await stopMemoryServer();
    console.log('[SeedRunner] Seed completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('[SeedRunner] Error during seed:', error);
    process.exit(1);
  }
}

main();

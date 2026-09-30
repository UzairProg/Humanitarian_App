import mongoose from 'mongoose';
import { getMongoUri, disconnectDatabase } from '../../config/database';
import { runDemoSeed } from '../seeds/demo.seed';

async function main() {
  console.log('[DemoSeedRunner] Connecting to MongoDB...');
  try {
    const uri = await getMongoUri();
    await mongoose.connect(uri);
    console.log(`[DemoSeedRunner] Connected to MongoDB at: ${uri}`);
    await runDemoSeed(mongoose.connection);
    await disconnectDatabase();
    console.log('[DemoSeedRunner] Demo seed completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('[DemoSeedRunner] Error during demo seed:', error);
    process.exit(1);
  }
}

main();

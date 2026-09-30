import mongoose from 'mongoose';
import { getMongoUri, disconnectDatabase } from '../../config/database';
import { runDemoReset } from '../seeds/demo.seed';

async function main() {
  console.log('[DemoResetRunner] Connecting to MongoDB...');
  try {
    const uri = await getMongoUri();
    await mongoose.connect(uri);
    console.log(`[DemoResetRunner] Connected to MongoDB at: ${uri}`);
    await runDemoReset(mongoose.connection);
    await disconnectDatabase();
    console.log('[DemoResetRunner] Demo reset completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('[DemoResetRunner] Error during demo reset:', error);
    process.exit(1);
  }
}

main();

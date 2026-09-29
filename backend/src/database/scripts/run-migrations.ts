import mongoose from 'mongoose';
import { getMongoUri, stopMemoryServer } from '../database.module';
import { ALL_MONGOOSE_MODELS } from '../schemas';

async function main() {
  console.log('[MigrationRunner] Initializing MongoDB connection...');
  try {
    const uri = await getMongoUri();
    await mongoose.connect(uri);
    console.log(`[MigrationRunner] Connected to MongoDB at: ${uri}`);
    console.log('[MigrationRunner] Syncing collections and indexes...');

    for (const item of ALL_MONGOOSE_MODELS) {
      const model = mongoose.model(item.name, item.schema);
      await model.syncIndexes();
      console.log(` - Synchronized indexes for collection: ${model.collection.name}`);
    }

    await mongoose.disconnect();
    await stopMemoryServer();
    console.log('[MigrationRunner] All MongoDB collections and indexes are synchronized.');
    process.exit(0);
  } catch (error) {
    console.error('[MigrationRunner] Error during index synchronization:', error);
    process.exit(1);
  }
}

main();

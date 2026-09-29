import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ALL_MONGOOSE_MODELS } from './schemas';

let memoryServerInstance: any = null;

export async function getMongoUri(configService?: ConfigService): Promise<string> {
  const useMemory =
    process.env.USE_MEMORY_DB === 'true' ||
    process.env.NODE_ENV === 'test' ||
    configService?.get<string>('USE_MEMORY_DB') === 'true';

  if (useMemory) {
    if (!memoryServerInstance) {
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        memoryServerInstance = await MongoMemoryServer.create({
          instance: {
            dbName: 'al_husseiniya_dev',
          },
        });
        const uri = memoryServerInstance.getUri();
        console.log(`[Database] In-memory MongoDB Server started at: ${uri}`);
        return uri;
      } catch (err: any) {
        console.warn(`[Database] Could not start mongodb-memory-server: ${err.message}. Falling back to default URI.`);
      }
    } else {
      return memoryServerInstance.getUri();
    }
  }

  const configuredUri =
    configService?.get<string>('MONGODB_URI') ||
    process.env.MONGODB_URI ||
    'mongodb://localhost:27017/al_husseiniya_dev';

  return configuredUri;
}

export async function stopMemoryServer(): Promise<void> {
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
    memoryServerInstance = null;
  }
}

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const uri = await getMongoUri(configService);
        return {
          uri,
          dbName: configService.get<string>('MONGODB_DATABASE', 'al_husseiniya_dev'),
        };
      },
    }),
    MongooseModule.forFeature(ALL_MONGOOSE_MODELS),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}

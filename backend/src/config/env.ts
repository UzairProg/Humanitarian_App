import dotenv from 'dotenv';
import path from 'path';

// Load .env from root or backend directory
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config(); // fallback to local .env

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  APP_NAME: process.env.APP_NAME || 'Al-Husseiniya',
  APP_PORT: parseInt(process.env.APP_PORT || '4000', 10),
  APP_BASE_URL: process.env.APP_BASE_URL || 'http://localhost:4000',
  API_PREFIX: process.env.API_PREFIX || 'api/v1',
  CORS_ORIGIN: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:3000', 'http://localhost:5173'],

  // MongoDB
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/al_husseiniya_dev',
  MONGODB_DATABASE: process.env.MONGODB_DATABASE || 'al_husseiniya_dev',
  USE_MEMORY_DB: process.env.USE_MEMORY_DB === 'true' || process.env.NODE_ENV === 'test',

  // JWT
  JWT_ACCESS_SECRET:
    process.env.JWT_ACCESS_SECRET ||
    'al_husseiniya_dev_jwt_access_secret_change_in_production_min32chars',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET ||
    'al_husseiniya_dev_jwt_refresh_secret_change_in_production_min32chars',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // Throttling
  THROTTLE_TTL: parseInt(process.env.THROTTLE_TTL || '60', 10),
  THROTTLE_LIMIT: parseInt(process.env.THROTTLE_LIMIT || '100', 10),

  // Storage
  STORAGE_DRIVER: process.env.STORAGE_DRIVER || 'local',
  STORAGE_LOCAL_ROOT: process.env.STORAGE_LOCAL_ROOT || './uploads',
  STORAGE_MAX_FILE_SIZE_MB: parseInt(process.env.STORAGE_MAX_FILE_SIZE_MB || '10', 10),

  // Audit
  ENABLE_AUDIT_LOGGING: process.env.ENABLE_AUDIT_LOGGING !== 'false',
};

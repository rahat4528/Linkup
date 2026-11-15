import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3005', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://linkup_admin:linkup_password@localhost:5437/linkup_spotify_db?schema=public',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6384',
  jwtSecret: process.env.JWT_SECRET || 'linkup_spotify_jwt_secret_dev_key_super_secure_32_bytes_min',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  audioStreamBaseUrl: process.env.AUDIO_STREAM_BASE_URL || 'http://localhost:3005/audio'
};

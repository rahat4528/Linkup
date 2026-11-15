import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4003', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3002',
  jwtSecret: process.env.JWT_SECRET || 'linkup_twitter_secret_key_123',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://linkup_user:linkup_secure_password@localhost:5434/linkup_twitter_db?schema=public',
};

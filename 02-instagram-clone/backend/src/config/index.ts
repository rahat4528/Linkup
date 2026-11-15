import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4002', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
  jwtSecret: process.env.JWT_SECRET || 'linkup_instagram_default_jwt_secret_123',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://linkup_user:linkup_secure_password@localhost:5433/linkup_instagram_db?schema=public',
};

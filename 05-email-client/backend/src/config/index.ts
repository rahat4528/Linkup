import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3004', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://linkup_admin:linkup_password@localhost:5436/linkup_email_client_db?schema=public',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6383',
  jwtSecret: process.env.JWT_SECRET || 'linkup_email_jwt_secret_dev_key_super_secure_32_bytes_min',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  smtp: {
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '3025', 10),
    secure: process.env.SMTP_SECURE === 'true'
  },
  imap: {
    host: process.env.IMAP_HOST || 'localhost',
    port: parseInt(process.env.IMAP_PORT || '3143', 10),
    tls: process.env.IMAP_TLS === 'true'
  }
};

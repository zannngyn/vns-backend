import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(','),
}));

export const databaseConfig = registerAs('database', () => ({
  url: process.env.DATABASE_URL,
}));

export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
}));

export const jwtConfig = registerAs('jwt', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET || 'access_secret',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
  accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
  refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
}));

export const geminiConfig = registerAs('gemini', () => ({
  apiKey: process.env.GEMINI_API_KEY || '',
  embeddingModel: process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001',
  chatModel: process.env.GEMINI_CHAT_MODEL || 'gemini-2.0-flash',
}));

export const sepayConfig = registerAs('sepay', () => ({
  env: (process.env.SEPAY_ENV || 'sandbox') as 'sandbox' | 'production',
  merchantId: process.env.SEPAY_MERCHANT_ID || '',
  secretKey: process.env.SEPAY_SECRET_KEY || '',
  successUrl: process.env.SEPAY_SUCCESS_URL || 'http://localhost:5173/order-success',
  cancelUrl: process.env.SEPAY_CANCEL_URL || 'http://localhost:5173/checkout',
  errorUrl: process.env.SEPAY_ERROR_URL || 'http://localhost:5173/checkout?error=payment_failed',
}));

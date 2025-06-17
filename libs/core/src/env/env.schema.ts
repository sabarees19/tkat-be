import { environment } from '@tkat-backend/shared';
import { z } from 'zod';

export const EnvSchema = z.object({
  NODE_ENV: z.enum([
    environment.LOCAL,
    environment.DEVELOPMENT,
    environment.PRODUCTION,
  ]),
  PORT: z.string(),

  JWT_SECRET: z.string(),
  JWT_EXPIRATION_TIME: z.string(),

  SESSION_SECRET: z.string(),

  MONGODB_URI: z.string(),

  REDIS_HOST: z.string(),
  REDIS_PORT: z.string(),
  REDIS_USERNAME: z.string(),
  REDIS_PASSWORD: z.string(),

  AWS_ACCESS_KEY: z.string(),
  AWS_SECRET_KEY: z.string(),
  AWS_REGION: z.string(),
  USER_POOL_ID: z.string(),
  USER_CLIENT_ID: z.string(),
});

export type EnvType = z.infer<typeof EnvSchema>;

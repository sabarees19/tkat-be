import { FactoryProvider, Inject, Logger } from '@nestjs/common';
import { constant } from '@tkat-backend/shared';
import { EnvService } from '@tkat-backend/core';
import { createClient, RedisClientType } from 'redis';

export const redisSessionStoreProvider: FactoryProvider = {
  provide: constant.REDIS_SESSION_STORE_CLIENT,
  useFactory: async (envService: EnvService) => {
    const logger = new Logger('RedisSessionStoreProvider');

    logger.debug('connecting to redis for session');

    try {
      const redisClient = createClient({
        url: envService.get('REDIS_URL'),
      })
        .on('error', (err) =>
          logger.error(`Redis session Client Error: ${err}`)
        )
        .on('ready', () => logger.debug(`Redis session Client Connected`));
      await redisClient.connect();
      return redisClient as RedisClientType;
    } catch (error) {
      logger.error(`error connecting to redis for session: ${error}`);
      return null;
    }
  },
  inject: [EnvService],
};

export function REDIS_SESSION_STORE() {
  return Inject(constant.REDIS_SESSION_STORE_CLIENT);
}

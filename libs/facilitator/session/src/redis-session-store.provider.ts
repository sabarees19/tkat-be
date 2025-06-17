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
      const redisClient =
        // createClient({
        //   username:
        //     process.env['REDIS_USERNAME'] || envService.get('REDIS_USERNAME'),
        //   password:
        //     process.env['REDIS_PASSWORD'] || envService.get('REDIS_PASSWORD'),
        //   database: 0,
        //   socket: {
        //     reconnectStrategy: false,
        //     host: process.env['REDIS_HOST'] || envService.get('REDIS_HOST'),
        //     port: parseInt(
        //       process.env['REDIS_PORT'] || envService.get('REDIS_PORT')
        //     ),
        //   },
        // })
        createClient({
          url: 'rediss://default:AcLXAAIjcDFjMWNlNGM2YzhiNzU0NzhhOWZkZjZiZWI5Nzg3YWI3M3AxMA@perfect-collie-49879.upstash.io:6379',
        })
          .on('error', (err) => {
            logger.log(process.env['REDIS_URL'], envService.get('REDIS_URL'));
            logger.error(`Redis session Client Error: ${err}`);
          })
          .on('ready', () => logger.debug(`Redis session Client Connected`));

      await redisClient.connect();
      return redisClient as RedisClientType;
    } catch (error) {
      logger.error(`error connecting to redis for session: ${error}`);
      throw error;
    }
  },
  inject: [EnvService],
};

export function REDIS_SESSION_STORE() {
  return Inject(constant.REDIS_SESSION_STORE_CLIENT);
}

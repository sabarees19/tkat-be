import { ClientOptions, Transport } from '@nestjs/microservices';
import { EnvService } from '../env/env.service';

export function getRedisTransportOption(envService: EnvService) {
  return {
    transport: Transport.REDIS,
    options: {
      host: process.env['REDIS_HOST'] || envService.get('REDIS_HOST'),
      port: parseInt(process.env['REDIS_PORT'] || envService.get('REDIS_PORT')),
      username:
        process.env['REDIS_USERNAME'] || envService.get('REDIS_USERNAME'),
      password:
        process.env['REDIS_PASSWORD'] || envService.get('REDIS_PASSWORD'),
    },
  } as ClientOptions;
}

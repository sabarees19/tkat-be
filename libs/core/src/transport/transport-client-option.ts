import { ClientOptions, Transport } from '@nestjs/microservices';
import { EnvService } from '../env/env.service';

export function getRedisTransportOption(envService: EnvService) {
  return {
    transport: Transport.REDIS,
    options: {
      host: envService.get('REDIS_HOST'),
      port: parseInt(envService.get('REDIS_PORT')),
      username: envService.get('REDIS_USERNAME'),
      password: envService.get('REDIS_PASSWORD'),
    },
  } as ClientOptions;
}

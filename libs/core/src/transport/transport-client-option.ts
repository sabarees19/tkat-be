import { ClientOptions, Transport } from '@nestjs/microservices';
import { EnvService } from '../env/env.service';

export function getRedisTransportOption(envService: EnvService) {
  const options: ClientOptions = {
    transport: Transport.REDIS,
    options: {
      host: envService.get('REDIS_HOST') || process.env['REDIS_HOST'],
      port:
        parseInt(envService.get('REDIS_PORT')) ||
        parseInt(process.env['REDIS_PORT'] as string),
      username:
        envService.get('REDIS_USERNAME') || process.env['REDIS_USERNAME'],
      password:
        envService.get('REDIS_PASSWORD') || process.env['REDIS_PASSWORD'],
    },
  };
  console.log(options.options);
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

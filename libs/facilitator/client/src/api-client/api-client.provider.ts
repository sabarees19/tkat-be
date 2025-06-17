import { FactoryProvider, Inject } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { EnvService } from '@tkat-backend/core';
import { getRedisTransportOption } from '@tkat-backend/core';
import { client } from '@tkat-backend/shared';
  
/**
 * This provider is used to create an instance of the API client.
 */
export const ApiClientProvider: FactoryProvider = {
  provide: client.API_CLIENT,
  useFactory: (envService: EnvService) => {
    return ClientProxyFactory.create(getRedisTransportOption(envService));
  },
  inject: [EnvService],
};

/**
 * Injects the API client instance.
 *
 * @returns {Client} The API client instance.
 */
export function ApiClient() {
  return Inject(client.API_CLIENT);
}

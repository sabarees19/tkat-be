import { Injectable } from '@nestjs/common';
import { EnvType } from './env.schema';
import { ConfigService } from '@nestjs/config';

/**
 * Service for getting environment variables.
 */
@Injectable()
export class EnvService {
  /**
   * Constructor.
   * @param configService - The ConfigService instance for getting environment variables.
   */
  constructor(private readonly configService: ConfigService<EnvType>) {}

  /**
   * Get the value of the environment variable with the specified key.
   * @param key - The key of the environment variable.
   * @returns The value of the environment variable.
   * @throws Throws an error if the environment variable is not found.
   */
  get<T extends keyof EnvType>(key: T) {
    return this.configService.getOrThrow(key, { infer: true });
  }
}

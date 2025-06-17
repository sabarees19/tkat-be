import { Module } from '@nestjs/common';
import { ApiClientProvider } from './api-client.provider';

@Module({
  providers: [ApiClientProvider],
  exports: [ApiClientProvider],
})
export class ApiClientModule {}

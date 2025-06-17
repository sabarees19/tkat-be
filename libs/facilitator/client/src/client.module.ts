import { Module } from '@nestjs/common';
import { ApiClientModule } from './api-client/api-client.module';

@Module({
  imports: [ApiClientModule],
  exports: [ApiClientModule],
})
export class ClientModule {}

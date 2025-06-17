import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { redisSessionStoreProvider } from './redis-session-store.provider';

@Module({
  controllers: [],
  providers: [SessionService, redisSessionStoreProvider],
  exports: [SessionService],
})
export class SessionModule {}

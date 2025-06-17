import { Module } from '@nestjs/common';
import { userProvider } from '@tkat-backend/shared';
import { UtilsModule } from '@tkat-backend/utils';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

@Module({
  imports: [UtilsModule],
  providers: [UserRepository, userProvider, UserService],
  exports: [UserService],
})
export class UserLibModule {}

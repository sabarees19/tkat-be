import { Module } from '@nestjs/common';
import { UserLibModule } from '@tkat-backend/user';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [UserLibModule],
  providers : [AuthService],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule {}

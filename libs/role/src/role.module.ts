import { Module } from '@nestjs/common';
import { roleProvider } from '@tkat-backend/shared';
import { UtilsModule } from '@tkat-backend/utils';
import { RoleRepository } from './role.repository';
import { RoleService } from './role.service';

@Module({
  imports: [UtilsModule],
  controllers: [],
  providers: [roleProvider, RoleRepository, RoleService],
  exports: [RoleService],
})
export class RoleLibModule {}

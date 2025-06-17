import { Module } from '@nestjs/common';
import { RoleLibModule } from '@tkat-backend/role';
import {
  permissionMappingProvider,
  permissionProvider,
} from '@tkat-backend/shared';
import { UtilsModule } from '@tkat-backend/utils';
import { PermissionMappingRepository } from './permission-mapping.repository';
import { PermissionRepository } from './permission.repository';
import { PermissionService } from './permission.service';
import { PermissionMappingService } from './permission-mapping.service';
import { UserLibModule } from '@tkat-backend/user';

@Module({
  imports: [UtilsModule, RoleLibModule, UserLibModule],
  controllers: [],
  providers: [
    permissionMappingProvider,
    permissionProvider,
    PermissionMappingRepository,
    PermissionRepository,
    PermissionService,
    PermissionMappingService,
  ],
  exports: [PermissionService, PermissionMappingService],
})
export class PermissionLibModule {}

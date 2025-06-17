import { Module } from '@nestjs/common';
import { PermissionLibModule } from '@tkat-backend/permission';
import { PermissionController } from './permission.controller';
import { PermissionMappingController } from './permission-mapping.controller';

@Module({
  imports: [PermissionLibModule],
  controllers: [PermissionController, PermissionMappingController],
  exports: [PermissionLibModule]
})
export class PermissionModule {}

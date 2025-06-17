import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionMappingService } from '@tkat-backend/permission';
import { ClsService } from 'nestjs-cls';
import { PERMISSIONS_KEY } from './permission.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionMappingService: PermissionMappingService,
    private readonly clsService: ClsService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const user = this.clsService.get('session').user;
    const requiredPermissions = this.reflector.get<string[]>(PERMISSIONS_KEY, context.getHandler());
    if (!requiredPermissions) {
      return true;
    }
    const hasPermission = await this.permissionMappingService.hasPermission(requiredPermissions, user.roleId);
    if (!hasPermission) {
      throw new ForbiddenException('You are not authorized to perform this action');
    }
    return hasPermission;
  }
}

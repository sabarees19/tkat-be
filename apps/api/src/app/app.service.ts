import { Inject, Injectable } from '@nestjs/common';
import {
  constant,
  CreatePermissionDto,
  CreatePermissionMappingDto,
  DatabaseError,
  databaseErrorEnum,
  mongoDbConstant,
  Permission,
  PermissionDto,
  PermissionMapping,
  Role,
  User,
  UserDto,
  zodUserSchema,
} from '@tkat-backend/shared';
import dayjs from 'dayjs';
import { Model } from 'mongoose';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class AppService {
  constructor(
    @Inject(mongoDbConstant.USER_MODEL) private readonly userModel: Model<User>,
    @Inject(mongoDbConstant.ROLE_MODEL) private readonly roleModel: Model<Role>,
    @Inject(mongoDbConstant.PERMISSION_MODEL)
    private readonly permissionModel: Model<Permission>,
    @Inject(mongoDbConstant.PERMISSION_MAPPING_MODEL)
    private readonly permissionMappingModel: Model<PermissionMapping>,
    private readonly authService: AuthService
  ) {}

  getData(): { message: string } {
    return { message: 'Hello API' };
  }

  async createAdminUser(body: { email: string, userName: string, employeeId: string, roleId: string }) {
    const createdAt = dayjs.utc().format(constant.UTC_TIME_PATTERN);
    const result = await new this.userModel({
      email: body.email,
      userName: body.userName,
      employeeId: body.employeeId,
      roleId: body.roleId,
      createdAt,
      createdBy: 'system',
      updatedAt: createdAt,
      updatedBy: 'system',
    }).save();
    await this.authService.createUserInCognito(body.email);
    return `Admin user created`;
  }

  async seedData() {
    try {
      const createdAt = dayjs.utc().format(constant.UTC_TIME_PATTERN);
      const auditFields = {
        createdAt,
        createdBy: 'system',
        updatedAt: createdAt,
        updatedBy: 'system',
      };

      // Create Roles
      const roles = [
        { roleName: 'ADMIN', description: 'Administrator with full access' , ...auditFields},
        {
          roleName: 'MANAGER',
          description: 'Manager with department level access',
          ...auditFields,
        },
        { roleName: 'USER', description: 'Regular user with limited access', ...auditFields},
      ];

      // Generate permissions array
      const permissions: CreatePermissionDto[] = [];

      // Add permissions for USER module
      const userPermissions = ['LIST', 'ADD', 'UPDATE', 'DELETE'];
      userPermissions.forEach((perm) => {
        permissions.push({
          permissionName: `USER:${perm}`,
          description: `Permission to ${perm.toLowerCase()} a user`,
          moduleName: 'USER',
          screenName: 'user-screen',
          ...auditFields,
        });
      });

      // Add permissions for TICKET module
      const ticketPermissions = ['CREATE', 'PENDING', 'HISTORY', 'DELETE'];
      ticketPermissions.forEach((perm) => {
        if (perm === 'CREATE') {
          permissions.push({
            permissionName: `TICKET:${perm}`,
            description: `Permission to ${perm.toLowerCase()} a ticket`,
            moduleName: 'TICKET',
            subModuleName: 'CREATE TICKET',
            screenName: 'ticket-screen',
            ...auditFields,
          });
        }
        else if (perm === 'PENDING' || perm === 'DELETE') {
          permissions.push({
            permissionName: `TICKET:${perm}`,
            description: `Permission to ${perm.toLowerCase()} a ticket`,
            moduleName: 'TICKET',
            subModuleName: 'PENDING',
            screenName: 'ticket-screen',
            ...auditFields,
          });
        }
        else if (perm === 'HISTORY') {
          permissions.push({
            permissionName: `TICKET:${perm}`,
            description: `Permission to ${perm.toLowerCase()} a ticket`,
            moduleName: 'TICKET',
            subModuleName: 'HISTORY',
            screenName: 'ticket-screen',
            ...auditFields,
          });
        }
      });

      // Add permissions for CONFIGURATION sub-modules
      const configPermissions = ['CREATE', 'LIST', 'UPDATE', 'DELETE'];
      const configSubModules = ['DEPARTMENT', 'CATEGORY'];
      configSubModules.forEach((subModule) => {
        configPermissions.forEach((perm) => {
          permissions.push({
            permissionName: `${subModule}:${perm}`,
            description: `Permission to ${perm.toLowerCase()} ${subModule.toLowerCase()}`,
            moduleName: 'CONFIGURATION',
            subModuleName: subModule,
            screenName: `${subModule.toLowerCase()}-screen`,
            ...auditFields,
          });
        });
      });

      // Add permissions for DASHBOARD module
      permissions.push({
        permissionName: 'DASHBOARD:LIST',
        description: 'Permission to list dashboard',
        moduleName: 'DASHBOARD',
        screenName: 'dashboard-screen',
        ...auditFields,
      });

      // Add permissions for TEMPLATE module
      const templatePermissions = ['CREATE', 'LIST', 'UPDATE', 'DELETE'];
      templatePermissions.forEach((perm) => {
        permissions.push({
          permissionName: `TEMPLATE:${perm}`,
          description: `Permission to ${perm.toLowerCase()} a template`,
          moduleName: 'TEMPLATE',
          screenName: 'template-screen',
          ...auditFields,
        });
      });

      // Insert roles and get their IDs
      const createdRoles = await this.roleModel.insertMany(roles);

      // Insert permissions and get their IDs
      const createdPermissions = await this.permissionModel.insertMany(
        permissions
      );

      // Create permission mappings based on role
      const permissionMappings: CreatePermissionMappingDto[] = [];

      // Map ADMIN role to all permissions
      createdPermissions.forEach((permission) => {
        permissionMappings.push({
          roleId: createdRoles.find((role) => role.roleName === 'ADMIN')
            ?._id as string,
          permissionId: permission._id as string,
          ...auditFields,
        });
      });

      // Map MANAGER role to specific permissions
      const managerRole = createdRoles.find(
        (role) => role.roleName === 'MANAGER'
      );
      createdPermissions
        .filter((permission) => !permission.permissionName.includes(':ALL'))
        .forEach((permission) => {
          permissionMappings.push({
            roleId: managerRole?._id as string,
            permissionId: permission._id as string,
            ...auditFields,
          });
        });

      // Map USER role to LIST permissions only
      const userRole = createdRoles.find((role) => role.roleName === 'USER');
      createdPermissions
        .filter((permission) => permission.permissionName.includes(':LIST'))
        .forEach((permission) => {
          permissionMappings.push({
            roleId: userRole?._id as string,
            permissionId: permission._id as string,
            ...auditFields,
          });
        });

      // Insert permission mappings
      const insertedPermissionMappings = await this.permissionMappingModel.insertMany(permissionMappings);

      console.log('Seed data inserted successfully');
      return {
        roles: createdRoles,
        permissions: createdPermissions,
        mappings: insertedPermissionMappings,
      };
    } catch (error) {
      console.error('Error seeding data:', error);
      throw error;
    }
  }
}

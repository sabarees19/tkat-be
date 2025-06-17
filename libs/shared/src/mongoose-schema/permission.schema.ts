import { Connection, Schema } from 'mongoose';
import { mongoDbConstant } from '../constant/mongodb';
import { BaseDocument, baseSchema } from './base.schema';
import { tableName } from '../constant/table-name';

export const permissionSchema = new Schema({
  permissionName: { type: String, required: true },
  description: { type: String },
  moduleName: { type: String, required: true },
  subModuleName: { type: String },
  screenName: { type: String, required: true },
  ...baseSchema.obj,
});

export interface Permission extends BaseDocument {
  permissionName: string;
  description?: string;
  moduleName: string;
  subModuleName?: string;
  screenName: string;
}

export const permissionProvider = {
  provide: mongoDbConstant.PERMISSION_MODEL,
  useFactory: (connection: Connection) =>
    connection.model<Permission>(tableName.PERMISSION, permissionSchema),
  inject: [mongoDbConstant.MONGO_DB_CONNECTION],
};

export const permissionMappingSchema = new Schema({
  permissionId: { type: String, required: true },
  roleId: { type: String },
  userId: { type: String },
  ...baseSchema.obj
});

export interface PermissionMapping extends BaseDocument {
  permissionId: string;
  roleId?: string;
  userId?: string;
}

export const permissionMappingProvider = {
  provide: mongoDbConstant.PERMISSION_MAPPING_MODEL,
  useFactory: (connection: Connection) =>
    connection.model<PermissionMapping>(tableName.PERMISSION_MAPPING, permissionMappingSchema),
  inject: [mongoDbConstant.MONGO_DB_CONNECTION],
};

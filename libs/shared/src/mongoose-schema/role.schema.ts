import { Connection, Schema } from 'mongoose';
import { mongoDbConstant } from '../constant/mongodb';
import { tableName } from '../constant/table-name';
import { BaseDocument, baseSchema } from './base.schema';

const roleNames = ['ADMIN', 'MANAGER', 'USER'] as const;

export const roleSchema = new Schema({
  roleName: { type: String, enum: roleNames, unique: true, required: true },
  description: { type: String },
  ...baseSchema.obj,
});

export interface Role extends BaseDocument {
  roleName: (typeof roleNames)[keyof typeof roleNames];
  description?: string;
}

export const roleProvider = {
  provide: mongoDbConstant.ROLE_MODEL,
  useFactory: (connection: Connection) =>
    connection.model(tableName.ROLE, roleSchema),
  inject: [mongoDbConstant.MONGO_DB_CONNECTION],
};

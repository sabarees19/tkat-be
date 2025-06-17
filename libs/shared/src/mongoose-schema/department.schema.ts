import { Connection, Schema } from 'mongoose';
import { mongoDbConstant } from '../constant/mongodb';
import { tableName } from '../constant/table-name';
import { BaseDocument, baseSchema } from './base.schema';

export interface Department extends BaseDocument {
  departmentName: String;
  departmentCheckName: String;
  description?: String;
}

export const departmentSchema = new Schema({
  departmentName: { type: String, required: true },
  departmentCheckName: { type: String, required: true },
  description: String,
  ...baseSchema.obj,
});

export const departmentProvider = {
  provide: mongoDbConstant.DEPARTMENT_MODEL,
  useFactory: (connection: Connection) =>
    connection.model<Department>(tableName.DEPARTEMNT, departmentSchema),
  inject: [mongoDbConstant.MONGO_DB_CONNECTION],
};

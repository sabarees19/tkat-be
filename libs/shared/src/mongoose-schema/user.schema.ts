import { Connection, Schema } from 'mongoose';
import { mongoDbConstant } from '../constant/mongodb';
import { tableName } from '../constant/table-name';
import { BaseDocument, baseSchema } from './base.schema';

export const userStatusEnum = ['Not Verified', 'Active', 'Inactive'] as const;

export const userSchema = new Schema({
  email: { type: String, required: true },
  userName: { type: String, required: true },
  employeeId: String,
  designation: String,
  department: String,
  dateOfBirth: Date,
  dateOfJoining: Date,
  location: String,
  phoneNumber: String,
  profilePicture: { type: String, required: false },
  roleId: { type: String, required: true },
  userStatus: {
    type: String,
    enum: userStatusEnum,
    default: 'Not Verified',
    required: true,
  },
  ...baseSchema.obj,
});

export interface User extends BaseDocument {
  email: string;
  userName?: string;
  roleId: string;
  dateOfBirth: Date;
  employeeId: String;
  designation: String;
  department: String;
  dateOfJoining: Date;
  location: String;
  phoneNumber: String;
  profilePicture: String;
  userStatus: (typeof userStatusEnum)[keyof typeof userStatusEnum];
}

export const userProvider = {
  provide: mongoDbConstant.USER_MODEL,
  useFactory: (connection: Connection) =>
    connection.model<User>(tableName.USER, userSchema),
  inject: [mongoDbConstant.MONGO_DB_CONNECTION],
};

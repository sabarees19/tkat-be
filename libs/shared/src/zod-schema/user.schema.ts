import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';
import { userStatusEnum } from '../mongoose-schema/user.schema';
import { zodBaseSchema, zodBaseSchemaObject } from './base.schema';

export const zodUserSchema = z
  .object({
    email: z.string().email().toLowerCase(),
    userName: z.string(),
    employeeId: z.string().optional(),
    designation: z.string().optional(),
    department: z.string().optional(),
    dateOfBirth: z.date().optional(),
    dateOfJoining: z.date().optional(),
    location: z.string().optional(),
    phoneNumber: z.string().optional(),
    profilePicture: z.string().optional(),
    roleId: z.string(),
    userStatus: z.enum(userStatusEnum),
  })
  .merge(zodBaseSchema);

export class UserDto extends createZodDto(zodUserSchema) {}

export const zodUserCreateSchema = zodUserSchema.omit({
  ...zodBaseSchemaObject,
  userStatus: true,
});

export class CreateUserDto extends createZodDto(zodUserCreateSchema) {}

export const zodUpdateUserSchema = zodUserSchema
  .omit({ ...zodBaseSchemaObject, email: true })
  .partial();

export class UpdateUserDto extends createZodDto(zodUpdateUserSchema) {}

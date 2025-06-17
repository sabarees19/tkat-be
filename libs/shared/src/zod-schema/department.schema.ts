import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';
import { zodBaseSchema, zodBaseSchemaObject } from './base.schema';

export const zodDepartmentSchema = z
  .object({
    departmentName: z.string().min(2).max(20),
    departmentCheckName: z.string().min(2).max(20),
    description: z.string().max(50).optional(),
  })
  .merge(zodBaseSchema);

export const zodCreateDepartmentSchema = zodDepartmentSchema.omit({
  ...zodBaseSchemaObject,
  departmentCheckName: true,
});

export const zodUpdateDepartmentSchema = zodDepartmentSchema
  .omit(zodBaseSchemaObject)
  .partial()
  .refine((refine) => !refine.departmentCheckName, {
    message: 'departmentCheckName should not be present',
  });

export class DepartmentDto extends createZodDto(zodDepartmentSchema) {}

export class CreateDepartmentDto extends createZodDto(
  zodCreateDepartmentSchema
) {}

export class UpdateDepartmentDto extends createZodDto(
  zodUpdateDepartmentSchema
) {}

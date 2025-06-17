import { z } from 'zod';
import { zodBaseSchema, zodBaseSchemaObject } from './base.schema';
import { createZodDto } from '@anatine/zod-nestjs';

export const zodPermissionSchema = z
  .object({
    permissionName: z.string(),
    description: z.string().max(100).optional(),
    moduleName: z.string(),
    subModuleName: z.string().optional(),
    screenName: z.string(),
  })
  .merge(zodBaseSchema);

export const zodCreatePermissionSchema =
  zodPermissionSchema.omit(zodBaseSchemaObject);

export const zodUpdatePermissionSchema = zodPermissionSchema
  .omit({ ...zodBaseSchemaObject, permissionName: true })
  .partial();

export class PermissionDto extends createZodDto(zodPermissionSchema) {}

export class CreatePermissionDto extends createZodDto(
  zodCreatePermissionSchema
) {}

export class UpdatePermissionDto extends createZodDto(
  zodUpdatePermissionSchema
) {}

export const zodPermissionMappingSchema = z
  .object({
    userId: z.string().optional(),
    roleId: z.string().optional(),
    permissionId: z.string(),
  })
  .merge(zodBaseSchema);

export const zodPermissionMappingSchemaWithPermissionDetails = zodPermissionMappingSchema.extend({
  permissionDetails: zodPermissionSchema,
});

export const zodCreatePermissionMappingSchema = zodPermissionMappingSchema
  .omit(zodBaseSchemaObject)
  .refine((data) => data.roleId || data.userId, {
    message: 'Either roleId or userId must be provided',
  });

export const zodUpdatePermissionMappingSchema = zodPermissionMappingSchema.omit(
  zodBaseSchemaObject
).partial();

export class PermissionMappingDto extends createZodDto(
  zodPermissionMappingSchema
) {}

export class CreatePermissionMappingDto extends createZodDto(
  zodCreatePermissionMappingSchema
) {}

export class UpdatePermissionMappingDto extends createZodDto(
  zodUpdatePermissionMappingSchema
) {}

import { z } from "zod";
import { zodBaseSchema, zodBaseSchemaObject } from "./base.schema";
import { createZodDto } from "@anatine/zod-nestjs";

export const zodRoleNames = z.enum(['ADMIN', 'MANAGER', 'USER'])

export const zodRoleSchema = z.object({
    roleName: zodRoleNames,
    description: z.string().max(100).optional(),
}).merge(zodBaseSchema);

export const zodCreateRoleSchema = zodRoleSchema.omit(zodBaseSchemaObject);

export const zodUpdateRoleSchema = zodRoleSchema.omit({ ...zodBaseSchemaObject, roleName: true }).partial();

export class RoleDto extends createZodDto(zodRoleSchema) {}

export class CreateRoleDto extends createZodDto(zodCreateRoleSchema) {}

export class UpdateRoleDto extends createZodDto(zodUpdateRoleSchema) {}
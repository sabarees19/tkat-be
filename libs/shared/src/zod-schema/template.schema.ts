import { z } from "zod";
import { zodBaseSchema, zodBaseSchemaObject } from "./base.schema";
import { createZodDto } from "@anatine/zod-nestjs";

export const zodTemplateSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
}).merge(zodBaseSchema);

export const zodCreateTemplateSchema = zodTemplateSchema.omit({
  ...zodBaseSchemaObject,
  title: true,
  description: true,
});

export const zodUpdateTemplateSchema = zodTemplateSchema.omit({
  ...zodBaseSchemaObject,
}).partial();

export class TemplateDto extends createZodDto(zodTemplateSchema) {}

export class CreateTemplateDto extends createZodDto(zodCreateTemplateSchema) {}

export class UpdateTemplateDto extends createZodDto(zodUpdateTemplateSchema) {}
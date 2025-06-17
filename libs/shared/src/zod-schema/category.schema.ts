import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';
import { approvalFlowEnum } from '../mongoose-schema/category.schema';
import { zodBaseSchema, zodBaseSchemaObject } from './base.schema';

export const zodCategoryApproverSchema = z
  .object({
    categoryId: z.string(),
    approverId: z.string(),
    approvalOrder: z.number(),
  })
  .merge(zodBaseSchema);

export const zodCreateCategoryApproverSchema =
  zodCategoryApproverSchema.omit(zodBaseSchemaObject);

export const zodUpdateCategoryApproverSchema = zodCategoryApproverSchema
  .omit({ ...zodBaseSchemaObject, categoryId: true, approverId: true })
  .partial();

export const zodCategorySchema = z
  .object({
    categoryName: z.string().min(2).max(20),
    categoryCheckName: z.string().min(2).max(20),
    departmentId: z.string(),
    templateId: z.string().optional(),
    description: z.string().max(100).optional(),
    approvalFlow: z.enum(approvalFlowEnum),
  })
  .merge(zodBaseSchema);

export const zodCreateCategorySchema = zodCategorySchema
  .omit({
    ...zodBaseSchemaObject,
    categoryCheckName: true,
  })
  .extend({
    approvers: z.array(
      z.object({
        approverId: z.string(),
        approvalOrder: z.number(),
      })
    ),
  });

export const zodUpdateCategorySchema = zodCategorySchema
  .omit({ ...zodBaseSchemaObject, departmentId: true })
  .extend({
    approvers: z.array(
      z.object({
        approverId: z.string(),
        approvalOrder: z.number(),
      })
    ),
  })
  .partial()
  .refine((refine) => !refine.categoryCheckName, {
    message: 'categoryCheckName should not be present',
  });

export const zodCategoryDetailsSchema = zodCategorySchema.extend({
  departmentName: z.string().optional(),
  createdByName: z.string().optional(),
  approvers: z.array(
    z.object({
      approverId: z.string(),
      approverName: z.string().optional(),
      employeeId: z.string().optional(),
      approvalOrder: z.number(),
    })
  ),
});

export class CategoryDto extends createZodDto(zodCategorySchema) {}

export class CategoryDetailsDto extends createZodDto(
  zodCategoryDetailsSchema
) {}

export class CreateCategoryDto extends createZodDto(zodCreateCategorySchema) {}

export class UpdateCategoryDto extends createZodDto(zodUpdateCategorySchema) {}

export class CategoryApproverDto extends createZodDto(
  zodCategoryApproverSchema
) {}

export class CreateCategoryApproverDto extends createZodDto(
  zodCreateCategoryApproverSchema
) {}

export class UpdateCategoryApproverDto extends createZodDto(
  zodUpdateCategoryApproverSchema
) {}

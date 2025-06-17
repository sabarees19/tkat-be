import { Connection, Schema } from 'mongoose';
import { mongoDbConstant } from '../constant/mongodb';
import { tableName } from '../constant/table-name';
import { BaseDocument, baseSchema } from './base.schema';

export const approvalFlowEnum = ['SEQUENTIAL', 'PARALLEL'] as const;

export const categorySchema = new Schema({
  categoryName: { type: String, required: true },
  categoryCheckName: { type: String, required: true },
  departmentId: { type: String, required: true },
  templateId: { type: String },
  description: { type: String },
  approvalFlow: { type: String, enum: approvalFlowEnum, required: true },
  ...baseSchema.obj,
});

export interface Category extends BaseDocument {
  categoryName: string;
  categoryCheckName: string;
  departmentId: string;
  templateId?: string;
  description?: string;
  approvalFlow: string;
}

export const categoryModelProvider = {
  provide: mongoDbConstant.CATEGORY_MODEL,
  useFactory: (connection: Connection) =>
    connection.model<Category>(tableName.CATEGORY, categorySchema),
  inject: [mongoDbConstant.MONGO_DB_CONNECTION],
};

export const categoryApproverSchema = new Schema({
  categoryId: { type: String, required: true },
  approverId: { type: String, required: true },
  approvalOrder: { type: Number },
  ...baseSchema.obj,
});

export interface CategoryApprover extends BaseDocument {
  categoryId: string;
  approverId: string;
  approvalOrder?: number;
}

export const categoryApproverModelProvider = {
  provide: mongoDbConstant.CATEGORY_APPROVER_MODEL,
  useFactory: (connection: Connection) =>
    connection.model<CategoryApprover>(
      tableName.CATEGORY_APPROVER,
      categoryApproverSchema
    ),
  inject: [mongoDbConstant.MONGO_DB_CONNECTION],
};

import mongoose, { Connection, Schema } from 'mongoose';
import { mongoDbConstant } from '../constant/mongodb';
import { tableName } from '../constant/table-name';
import { BaseDocument, baseSchema } from './base.schema';
import { approvalFlowEnum } from './category.schema';

export const ticketStatusEnum = [
  'Pending',
  'Rejected',
  'Approved',
  'Completed',
  'Cancelled',
] as const;

export const priorityEnum = {
  High: 3,
  Medium: 2,
  Low: 1,
} as const;

export interface Ticket extends BaseDocument {
  ticketId: number;
  status: (typeof ticketStatusEnum)[keyof typeof ticketStatusEnum];
  departmentId: string;
  categoryId: string;
  requesterId: string;
  assignerId?: string;
  description: string;
  priority: (typeof priorityEnum)[keyof typeof priorityEnum];
  approvalFlow: (typeof approvalFlowEnum)[keyof typeof approvalFlowEnum];
  isTicketClosed: boolean;
}

export const ticketSchema = new Schema({
  ticketId: { type: Number, required: true, default: 1 },
  status: { type: String, enum: ticketStatusEnum, required: true },
  departmentId: { type: String, required: true },
  categoryId: { type: String, required: true },
  requesterId: { type: String, required: true },
  assignerId: String,
  description: String,
  priority: { type: Number, enum: priorityEnum, required: true },
  approvalFlow: { type: String, enum: approvalFlowEnum, required: true },
  isTicketClosed: { type: Boolean, default: false },
  ...baseSchema.obj,
});

const AutoIncrement = require('mongoose-sequence')(mongoose);

ticketSchema.plugin(AutoIncrement, { inc_field: 'ticketId' });

export const ticketProvider = {
  provide: mongoDbConstant.TICKET_MODEL,
  useFactory: (connection: Connection) =>
    connection.model<Ticket>(tableName.TICKET, ticketSchema),
  inject: [mongoDbConstant.MONGO_DB_CONNECTION],
};

export const userType = ['APPROVER', 'CC'] as const;

export const approverStatusEnum = [
  'Pending',
  'Waiting',
  'Approved',
  'Rejected',
] as const;

export interface TicketParticipants extends BaseDocument {
  ticketId: string;
  userType: (typeof userType)[keyof typeof userType];
  userId: string;
  approvalOrder?: number;
  approvalFlow?: (typeof approvalFlowEnum)[keyof typeof approvalFlowEnum];
  approverStatus?: (typeof approverStatusEnum)[keyof typeof approverStatusEnum];
  reason?: string;
}

export const ticketParticipantsSchema = new Schema({
  ticketId: { type: String, required: true },
  userType: { type: String, enum: userType, required: true },
  userId: { type: String, required: true },
  approvalOrder: Number,
  approvalFlow: { type: String, enum: approvalFlowEnum },
  approverStatus: { type: String, enum: approverStatusEnum },
  reason: String,
  ...baseSchema.obj,
});

export const ticketParticipantsModuleProvider = {
  provide: mongoDbConstant.TICKET_PARTICIPANTS_MODEL,
  useFactory: (connection: Connection) =>
    connection.model<TicketParticipants>(
      tableName.TICKET_PARTICIPANTS,
      ticketParticipantsSchema
    ),
  inject: [mongoDbConstant.MONGO_DB_CONNECTION],
};

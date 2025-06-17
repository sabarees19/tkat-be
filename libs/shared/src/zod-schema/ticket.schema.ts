import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';
import { approvalFlowEnum } from '../mongoose-schema/category.schema';
import {
  approverStatusEnum,
  priorityEnum,
  ticketStatusEnum,
  userType,
} from '../mongoose-schema/ticket.schema';
import { zodBaseSchema, zodBaseSchemaObject } from './base.schema';
import { zodCreateResponseSchema, zodResponseSchema } from './response.schema';

export const zodTicketSchema = z
  .object({
    ticketId: z.number(),
    status: z.enum(ticketStatusEnum),
    departmentId: z.string(),
    categoryId: z.string(),
    description: z.string().optional(),
    requesterId: z.string(),
    assignerId: z.string().optional(),
    priority: z.nativeEnum(priorityEnum),
    approvalFlow: z.enum(approvalFlowEnum),
    isTicketClosed: z.boolean(),
  })
  .merge(zodBaseSchema);

export class TicketDto extends createZodDto(zodTicketSchema) {}

export const zodTicketCreateSchema = zodTicketSchema
  .omit({
    ...zodBaseSchemaObject,
    approvalFlow: true,
    ticketId: true,
    status: true,
    requesterId: true,
    isTicketClosed: true,
  })
  .merge(
    z.object({
      ccIds: z
        .array(z.string())
        .refine((data) => data.length === new Set(data).size, {
          message: 'ccIds must be unique',
        }),
      responses: z.array(zodCreateResponseSchema.omit({ ticketId: true })).optional(),
    })
  );

export class TicketCreateDto extends createZodDto(zodTicketCreateSchema) {}

export const zodTicketUpdateSchema = zodTicketSchema
  .partial()
  .omit({
    ticketId: true,
    requesterId: true,
    approvalFlow: true,
  })
  .refine(
    (data) => data.status === 'Completed' || data.status === 'Cancelled' || data.status === 'Approved',
    {
      message: 'status is not allowed to be updated',
    }
  );

export class TicketUpdateDto extends createZodDto(zodTicketUpdateSchema) {}

export const zodTicketPaticipantsSchema = z
  .object({
    ticketId: z.string(),
    userType: z.enum(userType),
    userId: z.string(),
    approvalOrder: z.number().optional(),
    approverStatus: z.enum(approverStatusEnum).optional(),
    reason: z.string().optional(),
  })
  .merge(zodBaseSchema);

export class TicketParticipantsDto extends createZodDto(
  zodTicketPaticipantsSchema
) {}

export const zodTicketParticipantsCreateSchema =
  zodTicketPaticipantsSchema.omit(zodBaseSchemaObject);

export class CreateTicketParticipantsDto extends createZodDto(
  zodTicketParticipantsCreateSchema
) {}

export const zodTicketParticipantsUpdateSchema =
  zodTicketParticipantsCreateSchema.partial();

export class UpdateTicketParticipantsDto extends createZodDto(
  zodTicketParticipantsUpdateSchema
) {}

export const zodTicketParticipantsDetailSchema =
  zodTicketPaticipantsSchema.merge(
    z.object({
      userName: z.string(),
      employeeId: z.string(),
    })
  );

export class TicketParticipantsDetailDto extends createZodDto(
  zodTicketParticipantsDetailSchema
) {}

export const zodTicketDetailSchema = zodTicketSchema.merge(
  z.object({
    departmentName: z.string().optional(),
    categoryName: z.string().optional(),
    requesterEmployeeId: z.string(),
    requesterUserName: z.string(),
    assignerEmployeeId: z.string().optional(),
    assignerUserName: z.string().optional(),
    approverId: z.string().optional(),
    approverStatus: z.enum(approverStatusEnum).optional(),
  })
);

export const zodTicketDetailsSchema = zodTicketDetailSchema.merge(
  z.object({
    canApprove: z.number().optional(),
    approvers: z.array(zodTicketParticipantsDetailSchema),
    cc: z.array(zodTicketParticipantsDetailSchema),
    responses: z.array(zodResponseSchema).optional(),
  })
);

export class TicketDetailsDto extends createZodDto(zodTicketDetailsSchema) {}

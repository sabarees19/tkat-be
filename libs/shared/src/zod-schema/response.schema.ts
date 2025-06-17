import { z } from "zod";
import { zodBaseSchema, zodBaseSchemaObject } from "./base.schema";
import { createZodDto } from "@anatine/zod-nestjs";
import { zodCreateQuestionSchema } from "./question.schema";

export const zodResponseSchema = z.object({
  ticketId: z.string(),
  question: zodCreateQuestionSchema,
  response: z.any(),
}).merge(zodBaseSchema);

export const zodCreateResponseSchema = zodResponseSchema.omit({
  ...zodBaseSchemaObject,
});

export const zodUpdateResponseSchema = zodResponseSchema.omit({
  ...zodBaseSchemaObject,
  ticketId: true,
  question: true,
}).partial();

export class ResponseDto extends createZodDto(zodResponseSchema) {}

export class CreateResponseDto extends createZodDto(zodCreateResponseSchema) {}

export class UpdateResponseDto extends createZodDto(zodUpdateResponseSchema) {}
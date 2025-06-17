import { z } from "zod";
import { zodBaseSchema, zodBaseSchemaObject } from "./base.schema";
import { createZodDto } from "@anatine/zod-nestjs";

export const questionTypeEnum = z.enum(['text', 'number', 'boolean', 'date', 'MCQ', 'multiSelect']);

export const questionModel = z.discriminatedUnion('type', [
  z.object({
    type: z.literal(questionTypeEnum.enum.text),
    text: z.string(),
  }),
  z.object({
    type: z.literal(questionTypeEnum.enum.number),
    text: z.string(),
    minValue: z.number().optional(),
    maxValue: z.number().optional(),
  }),
  z.object({
    type: z.literal(questionTypeEnum.enum.boolean),
    text: z.string(),
    options: z.tuple([z.literal('true'), z.literal('false')]),
  }),
  z.object({
    type: z.literal(questionTypeEnum.enum.date),
    text: z.string(),
  }),
  z.object({
    type: z.literal(questionTypeEnum.enum.MCQ),
    text: z.string(),
    options: z.array(z.string()),
  }),
  z.object({
    type: z.literal(questionTypeEnum.enum.multiSelect),
    text: z.string(),
    options: z.array(z.string()),
  }),
]);

export const zodQuestionSchema = z.object({
  required: z.boolean(),
  position: z.number(),
  templateId: z.string(),
  question: questionModel,
})
.merge(zodBaseSchema);

export const zodCreateQuestionSchema = zodQuestionSchema.omit({
  ...zodBaseSchemaObject,
});

export const zodUpdateQuestionSchema = zodQuestionSchema.omit({
  ...zodBaseSchemaObject,
  templateId: true,
}).partial();

export class QuestionDto extends createZodDto(zodQuestionSchema) {}

export class CreateQuestionDto extends createZodDto(zodCreateQuestionSchema) {}

export class UpdateQuestionDto extends createZodDto(zodUpdateQuestionSchema) {}
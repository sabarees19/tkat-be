import { z } from 'zod';
import { BaseError } from './base.error';

export const notFoundErrorEnum = z.enum([
  'DEPARTMENT_NOT_FOUND',
  'CATEGORY_NOT_FOUND',
  'USER_NOT_FOUND',
  'EMAIL_NOT_FOUND',
  'ROLE_NOT_FOUND',
  'PERMISSION_NOT_FOUND',
  'PERMISSION_MAPPING_NOT_FOUND',
  'CATEGORY_APPROVER_NOT_FOUND',
  'TICKET_NOT_FOUND',
  'TICKET_PARTICIPANTS_NOT_FOUND',
  'TEMPLATE_NOT_FOUND',
  'QUESTION_NOT_FOUND',
  'RESPONSE_NOT_FOUND',
]);

export const notFoundErrorMessages: Record<NotFoundErrorType, string> = {
  DEPARTMENT_NOT_FOUND: 'Department not found',
  CATEGORY_NOT_FOUND: 'Category not found',
  USER_NOT_FOUND: 'User not found',
  EMAIL_NOT_FOUND: 'Email not found',
  ROLE_NOT_FOUND: 'Role not found',
  PERMISSION_NOT_FOUND: 'Permission not found',
  PERMISSION_MAPPING_NOT_FOUND: 'Permission mapping not found',
  CATEGORY_APPROVER_NOT_FOUND: 'Category approver not found',
  TICKET_NOT_FOUND: 'Ticket not found',
  TICKET_PARTICIPANTS_NOT_FOUND: 'Ticket participants not found',
  TEMPLATE_NOT_FOUND: 'Template not found',
  QUESTION_NOT_FOUND: 'Question not found',
  RESPONSE_NOT_FOUND: 'Response not found',
};

export type NotFoundErrorType = z.infer<typeof notFoundErrorEnum>;

export class NotFoundError extends BaseError<NotFoundErrorType> {
  constructor(
    name: NotFoundErrorType,
    details?: { message?: string; cause?: unknown }
  ) {
    super({
      name,
      message: details?.message ? details.message : notFoundErrorMessages[name],
      cause: details?.cause,
    });
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

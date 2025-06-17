import { z } from 'zod';
import { BaseError } from './base.error';

export const badRequestErrorEnum = z.enum([
  'UPDATE_REQUEST_EMPTY',
  'CATEGORY_NAME_ALREADY_EXISTS',
  'DEPARTMENT_NAME_ALREADY_EXISTS',
  'USER_EMAIL_ALREADY_EXISTS',
  'TEMPLATE_NAME_ALREADY_EXISTS',
  'TICKET_STATUS_ALREADY_UPDATED',
]);

export const badRequestErrorMessages: Record<BadRequestErrorEnumType, string> =
  {
    UPDATE_REQUEST_EMPTY: 'Update data cannot be empty',
    CATEGORY_NAME_ALREADY_EXISTS:
      'Category with the given name already exists in this department',
    DEPARTMENT_NAME_ALREADY_EXISTS:
      'Department with the given name already exists',
    USER_EMAIL_ALREADY_EXISTS: 'User with the given email already exists',
    TEMPLATE_NAME_ALREADY_EXISTS: 'Template with the given name already exists',
    TICKET_STATUS_ALREADY_UPDATED: 'Ticket status is already updated',
  };

export type BadRequestErrorEnumType = z.infer<typeof badRequestErrorEnum>;

export class BadRequestError extends BaseError<BadRequestErrorEnumType> {
  constructor(
    name: BadRequestErrorEnumType,
    details?: { message?: string; cause?: unknown }
  ) {
    super({
      name,
      message: details?.message
        ? details.message
        : badRequestErrorMessages[name],
      cause: details?.cause,
    });
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

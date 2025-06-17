import { z } from 'zod';
import { BaseError } from './base.error';

export const databaseErrorEnum = z.enum([
  'DATABASE_CONNECTION_NOT_ESTABLISHED',
  'DATABASE_ERROR',
]);

export type DatabaseErrorType = z.infer<typeof databaseErrorEnum>;

export const databaseErrorMessages: Record<DatabaseErrorType, string> = {
  DATABASE_CONNECTION_NOT_ESTABLISHED: 'Database connection is not established',
  DATABASE_ERROR: 'Something went wrong with database',
};

export class DatabaseError extends BaseError<DatabaseErrorType> {
  constructor(
    name: DatabaseErrorType,
    details?: { message?: string; cause?: unknown }
  ) {
    super({
      name,
      message: details?.message ? details.message : databaseErrorMessages[name],
      cause: details?.cause,
    });
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

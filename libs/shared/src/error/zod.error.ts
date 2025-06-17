import { z } from 'zod';
import { BaseError } from './base.error';

export const zodErrorEnum = z.enum(['PARSE_ERROR']);

export const zodErrorMessages: Record<ZodErrorEnumType, string> = {
  PARSE_ERROR: 'Error parsing Zod schema',
};

export type ZodErrorEnumType = z.infer<typeof zodErrorEnum>;

export class ZodError extends BaseError<ZodErrorEnumType> {
  constructor(name: ZodErrorEnumType, details?: { message?: string; cause?: unknown }) {
    super({
      name,
      message: details?.message ? details.message : zodErrorMessages[name],
      cause: details?.cause,
    });

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, new.target.prototype);

    // Capture stack trace with proper prototype chain
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    // If cause is an Error, preserve its stack
    if (details?.cause instanceof Error) {
      this.stack = `${this.stack}\nCaused by: ${details?.cause?.stack}`;
    }
  }
}

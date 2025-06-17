import { z } from 'zod';
import { BaseError } from './base.error';

export const authErrorEnum = z.enum([
  'BEARER_TOKEN_NOT_FOUND',
  'INVALID_BEARER_TOKEN',
  'SESSION_EXPIRED',
]);

export const authErrorMessages: Record<AuthErrorEnumType, string> = {
  BEARER_TOKEN_NOT_FOUND: 'No Bearer token found in request headers',
  INVALID_BEARER_TOKEN: 'Invalid Bearer token found in request headers',
  SESSION_EXPIRED: 'Session Expired',
};

export type AuthErrorEnumType = z.infer<typeof authErrorEnum>;

export class AuthError extends BaseError<AuthErrorEnumType> {
  constructor(
    name: AuthErrorEnumType,
    details?: { message?: string; cause?: unknown }
  ) {
    super({
      name,
      message: details?.message ? details.message : authErrorMessages[name],
      cause: details?.cause,
    });
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

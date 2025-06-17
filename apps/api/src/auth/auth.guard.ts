import {
    CanActivate,
    ExecutionContext,
    Injectable
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthError, authErrorEnum } from '@tkat-backend/shared';
import { IS_PUBLIC_KEY } from './auth.public';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest();
      if (!request?.session?.isAuthenticated) {
        throw new AuthError(authErrorEnum.enum.SESSION_EXPIRED);
      }
    }
    return true;
  }
}

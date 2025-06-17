import { ZodValidationPipe } from '@anatine/zod-nestjs';
import { ExecutionContext, Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { CoreModule } from '@tkat-backend/core';
import { SessionModule } from '@tkat-backend/session';
import { AllExceptionFilter, permissionMappingProvider, permissionProvider, roleProvider, userProvider } from '@tkat-backend/shared';
import { ClsModule, ClsService } from 'nestjs-cls';
import { AuthGuard } from '../auth/auth.guard';
import { AuthModule } from '../auth/auth.module';
import { CategoryModule } from '../category/category.module';
import { DepartmentModule } from '../department/department.module';
import { PermissionModule } from '../permission/permission.module';
import { RoleModule } from '../role/role.module';
import { TicketModule } from '../ticket/ticket.module';
import { UserModule } from '../user/user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PermissionsGuard } from '../auth/permission.guard';
import { TemplateModule } from '../template/template.module';

const zodValidationProvider = {
  provide: APP_PIPE,
  useClass: ZodValidationPipe,
};

const allExceptionFilterProvider = {
  provide: APP_FILTER,
  useClass: AllExceptionFilter,
};

const appAuthGuard = {
  provide: APP_GUARD,
  useClass: AuthGuard,
};

const appPermissionGuard = {
  provide: APP_GUARD,
  useClass: PermissionsGuard,
};

export const clsSetupHelper = (cls: ClsService, context: ExecutionContext) => {
  try {
    let session: Record<string, any> | null = null;
    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest();
      session = request.session;
    } else if (context.getType() === 'ws') {
      const request = context.switchToWs().getClient();
      session = request.request.session;
    }

    cls.set('session', session);
  } catch (e: any) {
    throw new Error(e.message);
  }
};

@Module({
  imports: [
    JwtModule,
    CoreModule,
    SessionModule,
    CategoryModule,
    DepartmentModule,
    UserModule,
    AuthModule,
    RoleModule,
    PermissionModule,
    TicketModule,
    TemplateModule,
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        setup: (cls, req, res) => {
          cls.set('session', req.session);
        },
      },
      guard: {
        mount: true,
        setup: clsSetupHelper,
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    zodValidationProvider,
    allExceptionFilterProvider,
    appAuthGuard,
    appPermissionGuard,
    userProvider,
    roleProvider,
    permissionProvider,
    permissionMappingProvider
  ],
})
export class AppModule {}

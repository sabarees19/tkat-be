import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { AuthError } from './auth.error';
import { BadRequestError } from './bad-request.error';
import { NotFoundError } from './not-found.error';
import { ZodError } from './zod.error';
dayjs.extend(utc);

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  private logger = new Logger(AllExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    this.logger.error(exception);

    const ctx = host.switchToHttp();

    let message;
    let status;
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'object' && 'message' in response) {
        this.logger.log('here');
        status = exception.getStatus();
        message = response.message;
      } else {
        message = String(response);
      }
    } else if (exception instanceof Error) {
      const result = this.errorMapper(exception);
      status = result.status;
      message = result.message;
    }

    const responseBody = {
      statusCode: status,
      timestamp: dayjs.utc(),
      message,
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, status);
  }

  private errorMapper(error: Error): { status: number; message: string } {
    if (error instanceof AuthError) {
      return { status: HttpStatus.UNAUTHORIZED, message: error.message };
    } else if (error instanceof ZodError || error instanceof BadRequestError) {
      return { status: HttpStatus.BAD_REQUEST, message: error.message };
    } else if (error instanceof NotFoundError) {
      return { status: HttpStatus.NOT_FOUND, message: error.message };
    } else {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }
}

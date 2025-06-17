/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { NestExpressApplication } from '@nestjs/platform-express';
import { EnvService } from '@tkat-backend/core';
import { SessionService } from '@tkat-backend/session';
import { AppModule } from './app/app.module';
import { Logger as PinoLogger, LoggerErrorInterceptor } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  // const sessionService = app.get(SessionService);
  // sessionService.setup(app);

  const envService = app.get(EnvService);

  const sessionService = app.get(SessionService);
  sessionService.setup(app);

  app.useLogger(app.get(PinoLogger));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = parseInt(envService.get('PORT'));
  console.log('port', port);
  await app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();

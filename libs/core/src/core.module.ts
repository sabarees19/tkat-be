import { Module, Global } from '@nestjs/common';
import { EnvModule } from './env/env.module';
import { ConfigModule } from '@nestjs/config';
import { EnvSchema } from './env/env.schema';
import { MongodbModule } from './mongodb/mongodb.module';
import { LoggerModule } from 'nestjs-pino';
import { pinoConfig } from './pino-logger/pino-logger.config';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'env/.env',
      validate: (env) => EnvSchema.parse(env),
      cache: true,
      expandVariables: true,
    }),
    LoggerModule.forRoot(pinoConfig),
    EnvModule,
    MongodbModule,
  ],
  controllers: [],
  providers: [],
  exports: [EnvModule, MongodbModule],
})
export class CoreModule {}

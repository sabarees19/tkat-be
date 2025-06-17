import { Injectable } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { EnvService } from '@tkat-backend/core';
import { environment, UserDto } from '@tkat-backend/shared';
import { RedisStore } from 'connect-redis';
import session from 'express-session';
import { RedisClientType } from 'redis';
import { REDIS_SESSION_STORE } from './redis-session-store.provider';

declare module 'express-session' {
    interface SessionData {
        id: string;
        isAuthenticated: boolean;
        user: UserDto;
    }
}

@Injectable()
export class SessionService {
    private sessionMiddleware: ReturnType<typeof session> | undefined;
    constructor(
        @REDIS_SESSION_STORE() private redisSessionStoreClient: RedisClientType,
        private envService: EnvService,
    ) { }

    setup(app: NestExpressApplication) {
        const redisSessionStore = new RedisStore({
            client: this.redisSessionStoreClient,
            prefix: 'sess:',
        });

        const sessionMiddlewareOption = {
            store: redisSessionStore,
            secret: this.envService.get('SESSION_SECRET'),
            resave: false,
            saveUninitialized: false,
            cookie: {
                secure: false,
                httpOnly: true,
                maxAge: 1000 * 60 * 60, // 1 hour
            },
        };

        const NODE_ENV = this.envService.get('NODE_ENV');
        if (NODE_ENV !== environment.LOCAL) {
            app.set('trust proxy', true);
            sessionMiddlewareOption.cookie && (sessionMiddlewareOption.cookie.secure = true);
        }
        this.sessionMiddleware = session(sessionMiddlewareOption);
        app.use(this.sessionMiddleware);
    }

    getSessionMiddleWare(): ReturnType<typeof session> {
        if (!this.sessionMiddleware) throw new Error(`Session middleware is not setup`);
        return this.sessionMiddleware;
    }
}

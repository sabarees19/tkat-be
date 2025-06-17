import { environment } from "@tkat-backend/shared";


export const pinoConfig = {
  pinoHttp: {
    level: process.env['NODE_ENV'] !== environment.PRODUCTION ? 'debug' : 'info',
    redact: {
      paths: ['req.headers', 'res.headers', 'req.remoteAddress', 'req.remotePort'],
      remove: true,
    },
    customProps: (_req: any, _res: any) => ({
      context: 'HTTP',
    }),
    transport:
      process.env['NODE_ENV'] !== environment.PRODUCTION
        ? {
            target: 'pino-pretty',
            options: {
              messageFormat: '[{context}] : {msg}',
              singleLine: true,
              colorize: true,
              levelFirst: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname,context',
            },
          }
        : undefined,
  },
};

import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
// import * as LokiTransport from 'winston-loki'; // Use if configured

const logLevel = process.env.LOG_LEVEL || 'info';

const transports: winston.transport[] = [
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
                return `${timestamp} [${level}] [${context || 'App'}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
            }),
        ),
    }),
    new winston.transports.DailyRotateFile({
        dirname: 'logs',
        filename: 'application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
        ),
    }),
];

// Add Loki if host is provided
if (process.env.LOKI_HOST) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const LokiTransport = require('winston-loki');
    transports.push(new LokiTransport({
        host: process.env.LOKI_HOST,
        labels: { app: 'jom-backend' },
        json: true,
        format: winston.format.json(),
        replaceTimestamp: true,
        onConnectionError: (err: any) => console.error('Loki Error:', err)
    }));
}

@Module({
    imports: [
        WinstonModule.forRoot({
            level: logLevel,
            transports,
        }),
    ],
    exports: [WinstonModule],
})
export class LoggerModule { }

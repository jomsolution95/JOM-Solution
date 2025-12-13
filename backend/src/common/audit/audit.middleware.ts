import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from './audit-log.schema';

@Injectable()
export class AuditMiddleware implements NestMiddleware {
    constructor(@InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>) { }

    use(req: Request, res: Response, next: NextFunction) {
        const start = Date.now();
        const { method, originalUrl, ip, body } = req;

        // Basic sensitive data masking
        const sanitizedBody = { ...body };
        if (sanitizedBody.password) sanitizedBody.password = '***';
        if (sanitizedBody.token) sanitizedBody.token = '***';

        res.on('finish', async () => {
            const duration = Date.now() - start;
            const statusCode = res.statusCode;
            const userId = (req as any).user?.sub;

            try {
                // Only log write operations or critical paths
                if (method !== 'GET' || originalUrl.includes('auth')) {
                    await this.auditLogModel.create({
                        user: userId,
                        method,
                        path: originalUrl,
                        ip,
                        body: sanitizedBody,
                        statusCode,
                        duration,
                    });
                }
            } catch (error) {
                console.error('Audit Log Error:', error);
            }
        });

        next();
    }
}

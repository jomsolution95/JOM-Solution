import * as Sentry from '@sentry/node';
// import { ProfilingIntegration } from '@sentry/profiling-node';

export function initializeSentry(app: any) {
    if (process.env.SENTRY_DSN) {
        Sentry.init({
            dsn: process.env.SENTRY_DSN,
            environment: process.env.NODE_ENV || 'development',
            integrations: [
                // Enable HTTP calls tracing
                // new Sentry.Integrations.Http({ tracing: true }),
                // Enable Express.js middleware tracing
                // new Sentry.Integrations.Express({ app }),
                // Enable Profiling
                // new ProfilingIntegration(),
            ],
            // Performance Monitoring
            tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
            // Profiling
            profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
            // Release tracking
            release: process.env.SENTRY_RELEASE || 'unknown',
            // Before send hook
            beforeSend(event, hint) {
                // Filter out sensitive data
                if (event.request) {
                    delete event.request.cookies;
                    if (event.request.headers) {
                        delete event.request.headers.authorization;
                        delete event.request.headers.cookie;
                    }
                }
                return event;
            },
        });

        console.log('✓ Sentry initialized');
    } else {
        console.warn('⚠ Sentry DSN not configured, error tracking disabled');
    }
}

export { Sentry };

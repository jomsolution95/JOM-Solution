import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

export function initializeSentry() {
    if (import.meta.env.VITE_SENTRY_DSN) {
        Sentry.init({
            dsn: import.meta.env.VITE_SENTRY_DSN,
            environment: import.meta.env.MODE,
            integrations: [
                new BrowserTracing(),
                new Sentry.Replay({
                    maskAllText: true,
                    blockAllMedia: true,
                }),
            ],
            // Performance Monitoring
            tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
            // Session Replay
            replaysSessionSampleRate: 0.1,
            replaysOnErrorSampleRate: 1.0,
            // Release tracking
            release: import.meta.env.VITE_SENTRY_RELEASE || 'unknown',
            // Before send hook
            beforeSend(event, hint) {
                // Filter out sensitive data
                if (event.request) {
                    delete event.request.cookies;
                    if (event.request.headers) {
                        delete event.request.headers.authorization;
                    }
                }
                return event;
            },
        });

        console.log('✓ Sentry initialized');
    } else {
        console.warn('⚠ Sentry DSN not configured');
    }
}

export { Sentry };

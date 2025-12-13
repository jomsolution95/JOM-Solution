/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_WEBSOCKET_URL: string;
    readonly VITE_APP_NAME: string;
    readonly VITE_APP_URL: string;
    readonly VITE_ENABLE_ANALYTICS: string;
    readonly VITE_ENABLE_SENTRY: string;
    readonly VITE_SENTRY_DSN: string;
    readonly VITE_GA_MEASUREMENT_ID: string;
    readonly VITE_HOTJAR_ID: string;
    readonly VITE_HOTJAR_SV: string;
    readonly VITE_WAVE_API_KEY: string;
    readonly VITE_ORANGE_MONEY_API_KEY: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

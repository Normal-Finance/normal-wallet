// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn:
    SENTRY_DSN ||
    'https://7a397ed20619494f9a7e50c2dbcd4757@o4504056500715520.ingest.sentry.io/4505410317385728',
  environment: process.env.NODE_ENV,
  debug: process.env.NODE_ENV === 'production' ? false : true,
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.33 : 1.0,
});

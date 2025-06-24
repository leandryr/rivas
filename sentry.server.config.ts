import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0, // captura 100% de las trazas de rendimiento
  environment: process.env.NODE_ENV,
  debug: process.env.NODE_ENV === 'development', // solo para ver errores en local
})

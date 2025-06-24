'use server'

import * as Sentry from '@sentry/nextjs'

export async function testSentry() {
  try {
    throw new Error('💥 Error forzado para probar Sentry')
  } catch (err) {
    console.error('[TEST SENTRY]', err)
    Sentry.captureException(err)
    return { error: 'Error capturado por Sentry correctamente' }
  }
}

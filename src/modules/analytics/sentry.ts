import { init, browserTracingIntegration, replayIntegration } from '@sentry/react'
import { isDevelopment } from 'lib/environment'
import { config } from '../../config'

init({
  environment: config.get('ENVIRONMENT'),
  release: `${config.get('SENTRY_RELEASE_PREFIX', 'builder')}@${process.env.REACT_APP_WEBSITE_VERSION!}`,
  dsn: config.get('SENTRY_DSN'),
  integrations: [browserTracingIntegration(), replayIntegration()],
  tracesSampleRate: 0.001,
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 0.01,
  enabled: !isDevelopment
})

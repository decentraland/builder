import { config } from 'config'

export const environment = config.get('ENVIRONMENT')
export const isDevelopment = window.location.hostname === 'localhost' || environment === 'development'
export const isProduction = environment === 'production'

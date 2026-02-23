import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' }),
  APP_KEY: Env.schema.string(),
  LOG_LEVEL: Env.schema.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']),

  /**
   * Google GenAI API key for image generation
   */
  GOOGLE_API_KEY: Env.schema.string(),

  /**
   * Optional API key for authenticating client requests.
   * Leave empty to disable API key auth.
   */
  API_KEY: Env.schema.string.optional(),
})

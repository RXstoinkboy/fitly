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
   * Google GenAI REST endpoint for image generation.
   * Defaults to the Gemini 2.5 Flash Preview model endpoint.
   */
  GOOGLE_GENAI_ENDPOINT: Env.schema.string.optional(),

  /**
   * Optional API key for authenticating client requests.
   * When set, every request must include an `x-api-key` header with this value.
   * Leave unset to disable API key authentication.
   */
  API_KEY: Env.schema.string.optional(),

  /**
   * PostgreSQL database connection settings
   */
  DB_HOST: Env.schema.string({ format: 'host' }),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string(),
})

import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import env from '#start/env'

/**
 * Middleware that validates an API key passed in the `x-api-key` header.
 * If no API_KEY is configured in the environment, authentication is skipped.
 */
export default class ApiKeyMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    const configuredApiKey = env.get('API_KEY')

    if (!configuredApiKey) {
      return next()
    }

    const providedApiKey = request.header('x-api-key')

    if (!providedApiKey || providedApiKey !== configuredApiKey) {
      return response.unauthorized({ error: 'Invalid or missing API key.' })
    }

    return next()
  }
}

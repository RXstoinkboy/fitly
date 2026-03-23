import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

const INSTALLATION_ID_HEADER = 'x-installation-id'
const INSTALLATION_ID_REGEX = /^[A-Za-z0-9_-]{10,128}$/

export default class InstallationIdMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    const installationId = request.header(INSTALLATION_ID_HEADER)

    if (!installationId) {
      return response.badRequest({ error: 'Missing installation id.' })
    }

    if (!INSTALLATION_ID_REGEX.test(installationId)) {
      return response.badRequest({ error: 'Invalid installation id.' })
    }

    return next()
  }
}

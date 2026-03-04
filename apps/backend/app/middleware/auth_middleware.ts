import User from '#models/user'
import { Secret } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class AuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const { request, response } = ctx
    const authHeader = request.header('Authorization')

    if (!authHeader?.startsWith('Bearer ')) {
      return response.unauthorized({ error: 'Missing token' })
    }

    const token = new Secret(authHeader.slice(7))

    const accessToken = await User.accessTokens.verify(token)

    if (!accessToken) {
      return response.unauthorized({ error: 'Invalid token' })
    }

    const user = await User.find(accessToken.tokenableId)

    if (!user) {
      return response.unauthorized({ error: 'User not found' })
    }

    ctx.currentUser = user

    return next()
  }
}

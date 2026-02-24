import { HttpContext, ExceptionHandler, errors } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'

export default class HttpExceptionHandler extends ExceptionHandler {
  protected debug = !app.inProduction

  async handle(error: unknown, ctx: HttpContext) {
    if (ctx.request.url().startsWith('/api')) {
      const status = error instanceof errors.E_ROUTE_NOT_FOUND ? 404 : 500
      const message = error instanceof Error ? error.message : 'Internal server error'
      return ctx.response.status(status).json({ error: message })
    }
    return super.handle(error, ctx)
  }

  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}

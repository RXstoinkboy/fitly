import router from '@adonisjs/core/services/router'
import server from '@adonisjs/core/services/server'

/**
 * The error handler is used to convert an exception
 * to a HTTP response.
 */
server.errorHandler(() => import('#middleware/exception_handler'))

/**
 * The server middleware stack runs middleware on every HTTP
 * request, including the ones where no route is found.
 */
server.use([
  () => import('@adonisjs/core/bodyparser_middleware'),
])

/**
 * Named middleware collection
 */
export const middleware = router.named({
  apiKey: () => import('#middleware/api_key_middleware'),
})

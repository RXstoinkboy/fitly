import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class AuthController {
  /**
   * Creates an anonymous user and returns an access token.
   * No credentials required — the returned token is the sole identity.
   */
  async anonymous({ response }: HttpContext) {
    // Anonymous users have no email or password — authentication relies solely on the
    // issued access token. An empty string is stored for the password column (which is
    // not nullable) because it will never be used for credential-based login.
    const user = await User.create({
      fullName: null,
      email: null,
      password: '',
    })

    const token = await User.accessTokens.create(user)

    return response.created({
      token: token.value!.release(),
      userId: user.id,
    })
  }
}

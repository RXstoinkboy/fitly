import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'

// `uids: ['email']` defines the lookup field for credential-based auth (email+password).
// Anonymous users do not have an email and will never use credential login —
// they authenticate exclusively via access tokens issued by the anonymous endpoint.
const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: string // UUID

  @column()
  declare fullName: string | null

  /**
   * Null for anonymous users — identity relies on the access token / UUID alone.
   */
  @column()
  declare email: string | null

  @column({ serializeAs: null })
  declare password: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @column()
  declare onboardingGenerationUsed: boolean

  @column()
  declare subscriptionPlan: string | null

  static accessTokens = DbAccessTokensProvider.forModel(User)
}

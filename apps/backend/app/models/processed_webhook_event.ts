import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class ProcessedWebhookEvent extends BaseModel {
  @column({ isPrimary: true })
  declare eventId: string

  @column()
  declare eventType: string

  @column()
  declare appUserId: string | null

  @column.dateTime({ autoCreate: true })
  declare processedAt: DateTime
}

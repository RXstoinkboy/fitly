import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'processed_webhook_events'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('event_id').primary()
      table.string('event_type').notNullable()
      table.string('app_user_id').nullable()
      table.timestamp('processed_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

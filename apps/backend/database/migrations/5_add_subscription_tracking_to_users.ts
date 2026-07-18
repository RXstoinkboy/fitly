import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('revenuecat_user_id').nullable().unique()
      table.string('subscription_status').nullable()
      table.string('subscription_period_type').nullable()
      table.timestamp('subscription_current_period_start').nullable()
      table.timestamp('subscription_current_period_end').nullable()
      table.timestamp('subscription_updated_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('revenuecat_user_id')
      table.dropColumn('subscription_status')
      table.dropColumn('subscription_period_type')
      table.dropColumn('subscription_current_period_start')
      table.dropColumn('subscription_current_period_end')
      table.dropColumn('subscription_updated_at')
    })
  }
}

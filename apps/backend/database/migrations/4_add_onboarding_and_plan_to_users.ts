import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('onboarding_generation_used').notNullable().defaultTo(false)
      table.string('subscription_plan').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('onboarding_generation_used')
      table.dropColumn('subscription_plan')
    })
  }
}

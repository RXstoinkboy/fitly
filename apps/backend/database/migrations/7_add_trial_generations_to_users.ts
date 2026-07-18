import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('trial_generations_used').notNullable().defaultTo(0)
      table.integer('trial_generations_limit').notNullable().defaultTo(20)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('trial_generations_used')
      table.dropColumn('trial_generations_limit')
    })
  }
}

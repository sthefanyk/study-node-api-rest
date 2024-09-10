import knex, { Knex } from 'knex'

export const knexInstance: Knex = knex({
  client: 'sqlite3',
  connection: {
    filename: './tmp/app.db',
  },
  useNullAsDefault: true,
})

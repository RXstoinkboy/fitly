import { defineConfig } from '@adonisjs/core/bodyparser'

const bodyParserConfig = defineConfig({
  allowedMethods: ['POST', 'PUT', 'PATCH', 'DELETE'],

  /*
  |--------------------------------------------------------------------------
  | JSON parser
  |--------------------------------------------------------------------------
  */
  json: {
    encoding: 'utf-8',
    limit: '20mb',
    strict: true,
    types: ['application/json', 'application/json-patch+json', 'application/vnd.api+json'],
  },

  /*
  |--------------------------------------------------------------------------
  | Multipart parser
  |--------------------------------------------------------------------------
  */
  multipart: {
    autoProcess: true,
    processManually: [],
    encoding: 'utf-8',
    fieldsLimit: '2mb',
    limit: '20mb',
    types: ['multipart/form-data'],
  },
})

export default bodyParserConfig

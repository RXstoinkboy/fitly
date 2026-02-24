import { defineConfig } from '@adonisjs/cors'

/**
 * Configuration options to tweak the CORS policy.
 * https://docs.adonisjs.com/guides/security/cors
 */
const corsConfig = defineConfig({
  enabled: true,
  // TODO: Restrict to specific origins in production. Currently allowing all origins
  //       for ease of development with Expo Go and local simulators.
  origin: true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
  headers: true,
  exposeHeaders: [],
  credentials: true,
  maxAge: 90,
})

export default corsConfig

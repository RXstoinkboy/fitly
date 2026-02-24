import env from '#start/env'
import { defineConfig } from '@adonisjs/core/logger'
import type { InferLoggers } from '@adonisjs/core/types'

const loggerConfig = defineConfig({
  default: 'app',
  loggers: {
    app: {
      enabled: true,
      name: '@virtual-try-on/backend',
      level: env.get('LOG_LEVEL'),
      transport: {
        targets: [
          {
            target: 'pino/file',
            level: env.get('LOG_LEVEL'),
            options: {
              destination: 1,
            },
          },
        ],
      },
    },
  },
})

export default loggerConfig

declare module '@adonisjs/core/types' {
  export interface LoggersList extends InferLoggers<typeof loggerConfig> {}
}

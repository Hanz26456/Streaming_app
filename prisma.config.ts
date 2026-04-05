import { defineConfig } from 'prisma/config'
import * as dotenv from 'dotenv'

dotenv.config() // ← tambahkan ini

export default defineConfig({
  earlyAccess: true,
  schema: 'prisma/schema.prisma',
})
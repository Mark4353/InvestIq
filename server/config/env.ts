import 'dotenv/config'

export const env = {
  port: Number(process.env.PORT ?? 5000),
}

export const db = {
  databaseUrl: process.env.DATABASE_URL ?? process.env.DATABASE_URL?.replace?.('postgresql://', 'postgresql://') ?? null,
  jwtSecret: process.env.JWT_SECRET ?? 'change_me',
}

import 'dotenv/config'

export const env = {
  port: Number(process.env.PORT ?? 5000),
}

export const db = {
  databaseUrl: (process.env.DATABASE_URL as string | undefined) ?? null,
  jwtSecret: (process.env.JWT_SECRET as string | undefined) ?? 'change_me',
}

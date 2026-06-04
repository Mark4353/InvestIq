import { Pool } from 'pg'
import { db as envDb } from './config/env'

if (!envDb.databaseUrl) {
  console.warn('DATABASE_URL not set; Postgres disabled')
}

const pool: Pool | null = envDb.databaseUrl ? new Pool({ connectionString: envDb.databaseUrl }) : null

// Ensure users table exists (only when pool is configured)
const ensureTables = async () => {
  if (!pool) return
  const client = await pool.connect()
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      )
    `)
  } finally {
    client.release()
  }
}

ensureTables().catch((err) => {
  console.error('Failed to ensure DB tables:', err)
})

// pool initialized when DATABASE_URL is provided

export const query = (text: string, params?: any[]) => {
  if (!pool) {
    throw new Error('Postgres not configured')
  }
  return pool.query(text, params)
}

export default pool

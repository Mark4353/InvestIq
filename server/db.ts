import { Pool } from 'pg'
import { db as envDb } from './config/env'

if (!envDb.databaseUrl) {
  console.warn('DATABASE_URL not set; Postgres disabled')
}

const connectionString = envDb.databaseUrl
const shouldUseSsl = Boolean(
  connectionString && !connectionString.includes('localhost') && !connectionString.includes('127.0.0.1')
)

const pool: Pool | null = connectionString
  ? new Pool({ connectionString, ...(shouldUseSsl ? { ssl: { rejectUnauthorized: false } } : {}) })
  : null


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
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY,
        user_id UUID,
        date DATE NOT NULL,
        description TEXT,
        category TEXT,
        amount NUMERIC NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
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



const testConnection = async () => {
  if (!pool) return
  try {
    await pool.query('SELECT 1')
    await ensureTables()
  } catch (err) {
    console.error('Failed to connect to Postgres, falling back to mock mode:', err)
    try {
      await pool.end()
    } catch {}
    // @ts-ignore
    ;(globalThis as any).__pg_pool = null
  }
}

testConnection().catch((err) => console.error('DB test failed:', err))

export const query = (text: string, params?: any[]) => {
  if (!pool) {
    throw new Error('Postgres not configured')
  }
  return pool.query(text, params)
}

export default pool
 

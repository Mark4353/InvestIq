import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg

const url = process.env.DATABASE_URL

if (!url) {
  console.error('DATABASE_URL not set in environment')
  process.exit(1)
}

const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } })

async function main() {
  try {
    const { rows } = await pool.query('SELECT id, email, created_at FROM users ORDER BY created_at DESC LIMIT 50')
    console.log(JSON.stringify(rows, null, 2))
  } catch (err) {
    console.error('Query failed:', err)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()

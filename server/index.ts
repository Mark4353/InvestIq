import cors from 'cors'
import express from 'express'
import { env, db as envDb } from './config/env.ts'
import { authRouter } from './routes/authRoutes.ts'
import { transactionsRouter } from './routes/transactionsRoutes.ts'
import './db'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', (_request, response) => {
  response.status(200).json({
    status: 'ok',
    mode: envDb.databaseUrl ? 'db' : 'mock',
  })
})

app.use('/api/auth', authRouter)
app.use('/api/transactions', transactionsRouter)

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${env.port}`)
})

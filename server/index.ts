import cors from 'cors'
import express from 'express'
import { env } from './config/env.ts'
import { authRouter } from './routes/authRoutes.ts'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', (_request, response) => {
  response.status(200).json({
    status: 'ok',
    mode: 'mock',
  })
})

app.use('/api/auth', authRouter)

app.listen(env.port, () => {
  console.log(`Mock API started on http://localhost:${env.port}`)
})

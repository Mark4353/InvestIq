import { useState } from 'react'
import { useAuth } from './useAuth'
import type {
  AuthUser,
  RegisterField,
  RegisterFormData,
  RegisterStatus,
} from '../types/auth'

const initialForm: RegisterFormData = {
  email: '',
  password: '',
}

const mockApiUsersUrl = import.meta.env.VITE_MOCKAPI_USERS_URL as string | undefined
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const readMockApiResponse = async (response: Response): Promise<AuthUser> => {
  const text = await response.text()

  if (!text) {
    throw new Error('Empty server response.')
  }

  let data: Partial<AuthUser> & { message?: string }

  try {
    data = JSON.parse(text) as Partial<AuthUser> & { message?: string }
  } catch {
    throw new Error('Invalid server response.')
  }

  if (!response.ok) {
    throw new Error(data.message || 'Request failed.')
  }

  if (!data.id || !data.email) {
    throw new Error('Incomplete user data.')
  }

  return {
    id: data.id,
    email: data.email,
    password: data.password,
    createdAt: data.createdAt,
    income: Number(data.income ?? 0),
    costs: Number(data.costs ?? 0),
  }
}

const ensureMockApiUrl = () => {
  if (!mockApiUsersUrl) {
    throw new Error('Server URL not set.')
  }

  return mockApiUsersUrl
}

export function useAuthForm() {
  const { setSession } = useAuth()
  const [form, setForm] = useState<RegisterFormData>(initialForm)
  const [status, setStatus] = useState<RegisterStatus>('idle')
  const [message, setMessage] = useState('')

  const updateField = (field: RegisterField, value: string) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  const submitRegister = async (): Promise<boolean> => {
    const email = form.email.trim().toLowerCase()

    if (!emailPattern.test(email)) {
      setStatus('error')
      setMessage('Enter a valid email.')
      return false
    }

    if (form.password.length < 6) {
      setStatus('error')
      setMessage('Password must be at least 6 characters.')
      return false
    }

    setStatus('loading')
    setMessage('')

    try {
      const queryUrl = `${ensureMockApiUrl()}?email=${encodeURIComponent(email)}`
      const existingResponse = await fetch(queryUrl)

      let existingList: Array<Partial<AuthUser>> = []

      if (!existingResponse.ok) {
        if (existingResponse.status === 404) {
          existingList = []
        } else {
          throw new Error('Failed to check users.')
        }
      } else {
        existingList = (await existingResponse.json()) as Array<Partial<AuthUser>>
      }

      if (existingList.length > 0) {
        const existing = existingList[0]
        if (existing.password === form.password) {
          const user = await readMockApiResponse(new Response(JSON.stringify(existing), { status: 200 }))
          setSession(`mockapi_${user.id}`, user)
          setStatus('success')
          setMessage('Logged in.')
          setForm(initialForm)
          return true
        }

        setStatus('error')
        setMessage('Email already registered with different password.')
        return false
      }

      const response = await fetch(ensureMockApiUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password: form.password,
          income: 0,
          costs: 0,
        }),
      })

      const user = await readMockApiResponse(response)

      setSession(`mockapi_${user.id}`, user)
      setStatus('success')
      setMessage('Account created.')
      setForm(initialForm)
      return true
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Registration failed.')
      return false
    }
  }

  return {
    form,
    status,
    message,
    isLoading: status === 'loading',
    updateField,
    submitRegister,
  }
}

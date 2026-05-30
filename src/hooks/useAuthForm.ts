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
    throw new Error(`Error (${response.status}).`)
  }

  let data: Partial<AuthUser> & { message?: string }

  try {
    data = JSON.parse(text) as Partial<AuthUser> & { message?: string }
  } catch {
    throw new Error(`Invalid JSON response (${response.status}).`)
  }

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status}).`)
  }

  if (!data.id || !data.email) {
    throw new Error('Missing id or email.')
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
    throw new Error('VITE_MOCKAPI_USERS_URL is missing in .env.')
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

  const submitRegister = async () => {
    const email = form.email.trim().toLowerCase()

    if (!emailPattern.test(email)) {
      setStatus('error')
      setMessage('Enter a valid email.')
      return
    }

    if (form.password.length < 6) {
      setStatus('error')
      setMessage('Password must be at least 6 characters.')
      return
    }

    setStatus('loading')
    setMessage('')

    try {
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
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Registration failed.')
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

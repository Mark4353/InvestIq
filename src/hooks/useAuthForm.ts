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

const apiBase = (import.meta.env.VITE_API_BASE as string | undefined) ?? ''
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// legacy mock helpers removed — use real API endpoints via `VITE_API_BASE`

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
      const response = await fetch(`${apiBase}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: form.password }),
      })

      const data = await response.json()
      if (!response.ok) {
          const errMsg = data?.message || JSON.stringify(data) || 'Registration failed.'
          throw new Error(errMsg)
      }

      const user: AuthUser = {
        id: data.user.id,
        email: data.user.email,
        createdAt: data.user.createdAt,
      }

      setSession(data.token, user)
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

  const submitLogin = async (): Promise<boolean> => {
    const email = form.email.trim().toLowerCase()

    if (!emailPattern.test(email)) {
      setStatus('error')
      setMessage('Enter a valid email.')
      return false
    }

    setStatus('loading')
    setMessage('')

    try {
      const response = await fetch(`${apiBase}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: form.password }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.message || 'Login failed.')
      }

      const user: AuthUser = { id: data.user.id, email: data.user.email, createdAt: data.user.createdAt }
      setSession(data.token, user)
      setStatus('success')
      setMessage('Logged in.')
      setForm(initialForm)
      return true
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Login failed.')
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
    submitLogin,
  }
}

export interface RegisterFormData {
  email: string
  password: string
}

export interface AuthUser {
  id: string
  email: string
  password?: string
  createdAt?: string
  income?: number
  costs?: number
}

export type RegisterStatus = 'idle' | 'loading' | 'success' | 'error'
export type RegisterField = keyof RegisterFormData

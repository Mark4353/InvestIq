import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { AuthContext, type AuthContextValue } from './authContext'
import type { AuthUser } from '../types/auth'
import { apiBase } from '../utils/api'

const authStorageKey = 'investiq_auth'

const readStoredSession = (): Pick<AuthContextValue, 'token' | 'user'> => {
  const storedValue = localStorage.getItem(authStorageKey)

  if (!storedValue) {
    return {
      token: null,
      user: null,
    }
  }

  try {
    const parsedValue = JSON.parse(storedValue) as Pick<
      AuthContextValue,
      'token' | 'user'
    >

    return {
      token: parsedValue.token ?? null,
      user: parsedValue.user ?? null,
    }
  } catch {
    localStorage.removeItem(authStorageKey)

    return {
      token: null,
      user: null,
    }
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSessionState] = useState(readStoredSession)

  useEffect(() => {
    const tryRefresh = async () => {
      if (session.token && !session.user) {
        try {
          const res = await fetch(`${apiBase}/api/auth/me`, {
            headers: { Authorization: `Bearer ${session.token}` },
          })
          if (res.ok) {
            const data = await res.json()
            setSessionState({ token: session.token, user: data.user })
          } else {
            localStorage.removeItem(authStorageKey)
            setSessionState({ token: null, user: null })
          }
        } catch {
          return
        }
      }
    }

    tryRefresh()
  }, [session.token, session.user])

  const setSession = useCallback((token: string, user: AuthUser) => {
    const nextSession = {
      token,
      user,
    }

    localStorage.setItem(authStorageKey, JSON.stringify(nextSession))
    setSessionState(nextSession)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(authStorageKey)
    setSessionState({
      token: null,
      user: null,
    })
  }, [])

  const value = useMemo(
    () => ({
      token: session.token,
      user: session.user,
      setSession,
      logout,
    }),
    [logout, session.token, session.user, setSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

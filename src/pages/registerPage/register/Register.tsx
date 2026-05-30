import type { FormEvent } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { useAuthForm } from '../../../hooks/useAuthForm'
import './Register.css'

const Register = () => {
  const { user, logout } = useAuth()
  const { form, status, message, isLoading, updateField, submitRegister } =
    useAuthForm()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void submitRegister()
  }

  return (
    <div className="register-page">
      <div className="hero">
        <div className="hero-content">
          <h1 className="brand">InvestIQ</h1>
          <p className="subtitle">SMART FINANCE</p>
        </div>
      </div>

      <aside className="auth-card">
        <div className="card-inner">
          {user && (
            <div className="session-panel">
              <p className="hint">Registered/Logged in as</p>
              <p className="session-email">{user.email}</p>
              <button className="btn secondary" type="button" onClick={logout}>
                Exit
              </button>
            </div>
          )}

          <p className="or-note">Register/Log in account</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="field-label" htmlFor="register-email">
              Email:
            </label>
            <input
              className="field"
              id="register-email"
              name="email"
              placeholder="your@email.com"
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              autoComplete="email"
              required
            />

            <label className="field-label" htmlFor="register-password">
              Password:
            </label>
            <input
              className="field"
              id="register-password"
              name="password"
              placeholder="........"
              type="password"
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
            />

            {message && <p className={`form-message ${status}`}>{message}</p>}

            <div className="actions">
              <button className="btn primary" type="submit" disabled={isLoading}>
                {isLoading ? 'Please wait...' : 'Register/Log in'}
              </button>
            </div>
          </form>
        </div>
      </aside>
    </div>
  )
}

export default Register

import './Header.css';
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

const Header = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const displayName = user?.email ? user.email.split('@')[0] : ''

  const handleLogout = () => {
    logout()
    navigate('/register')
  }

  return (
    <header className="header">
      <div className="logo">
        <img src="../../img/logo.png" alt="Logo" className="logo-image" />
        <a href="/home">InvestIQ</a>
      </div>

      <div className="header-actions">
        {user ? (
          <div className="user-area">
            <span className="welcome"><img src="../../img/user-icon.png" alt="User Icon" /> {displayName}</span>
            <button className="btn logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : null}
      </div>
    </header>
  )
}

export default Header;
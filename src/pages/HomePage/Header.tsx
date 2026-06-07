import './Header.css';
import { useAuth } from '../../hooks/useAuth'
import { useNavigate, Link } from 'react-router-dom'
import logoImg from '../../img/logo.png'
import userIconImg from '../../img/logo.svg'

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
        <img src={logoImg} alt="InvestIQ logo" className="logo-image" />
        <Link to="/home">InvestIQ</Link>
      </div>

      <div className="header-actions">
        {user ? (
          <div className="user-area">
            <span className="welcome"><img src={userIconImg} alt="User Icon" /> {displayName}</span>
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
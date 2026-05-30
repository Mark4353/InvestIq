import React from "react";
import "./Welcome.css";

const Welcome: React.FC = () => {
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
          <p className="hint">
            Ви можете авторизуватися за допомогою акаунта Google
          </p>
          <button className="btn google" type="button">
            <svg className="google-icon">
              <use xlinkHref="../../img/google-icon.svg" className="google-icon" />
            </svg>
           Google
          </button>

          <p className="or-note">
            Або увійти за допомогою ел. пошти та паролю після реєстрації
          </p>
          <form className="auth-form">
            <label className="field-label">Електронна пошта:</label>
            <input
              className="field"
              placeholder="your@email.com"
              type="email"
            />

            <label className="field-label">Пароль:</label>
            <input className="field" placeholder="........" type="password" />

            <div className="actions">
              <button className="btn primary" type="button">
                УВІЙТИ
              </button>
              <button className="btn secondary" type="button">
                РЕЄСТРАЦІЯ
              </button>
            </div>
          </form>
        </div>
      </aside>
    </div>
  );
};

export default Welcome;

/* src/pages/login/Login.jsx */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import { useAuth } from '../../context/auth/AuthContext.jsx';
import { useError } from '../../context/error/ErrorContext.jsx';

function Login({ theme }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showError } = useError();

  const [loading, setLoading] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailInput || !password) {
      showError("Введите email и пароль");
      return;
    }

    setLoading(true);
    try {
      await login(emailInput, password);
      navigate('/');
    } catch {
      showError("Неверный логин или пароль");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.loginContainer} ${styles[theme]}`}>

      <div className="closeButton" onClick={() => navigate("/")}>
        ✖
      </div>

      <h2>Вход</h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        
        <div className={styles.row}>
          <label>Email:</label>
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            className="input"
          />
        </div>

        <div className={styles.row}>
          <label>Пароль:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
        </div>

        <button
          type="submit"
          className="button"
          disabled={loading}
        >
          Войти
        </button>

      </form>

      <p className={styles.footer}>
        Авторизация сохраняется автоматически.
      </p>
    </div>
  );
}

export default Login;

// src/pages/register/Register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TimeZoneSelector from '../../components/timeZoneSelector/TimeZoneSelector';
import { API_URL } from "../../components/utils/api/config";
import styles from './Register.module.css';
import { useError } from '../../context/error/ErrorContext.jsx';

function Register({ theme }) {
  const navigate = useNavigate();
  const { showError } = useError();

  const [loading, setLoading] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [timeZoneId, setTimeZoneId] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!emailInput || !password || !confirmPassword) {
      showError("Заполните все поля");
      return;
    }

    if (password !== confirmPassword) {
      showError("Пароли не совпадают");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailInput,
          password,
          timeZone: timeZoneId || "UTC"
        })
      });

      const data = await res.json();

      if (!res.ok) {
        showError(data.error || "Ошибка регистрации");
        return;
      }

      navigate("/login");
    } catch {
      showError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.grid3}>
      <div className={`${styles.gridLogin} ${theme === 'dark' ? styles.dark : ''}`}>
        
        <div className="closeButton" onClick={() => navigate("/")}>
          ✖
        </div>

        <h2 className={styles.gridHeader}>Регистрация</h2>

        <form onSubmit={handleRegister} className={styles.gridForm}>
          
          <div className={styles.gridRow}>
            <label>Email:</label>
            <input
              type="email"
              className="input"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
            />
          </div>

          <div className={styles.gridRow}>
            <label>Пароль:</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className={styles.gridRow}>
            <label>Повторите пароль:</label>
            <input
              type="password"
              className="input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className={styles.gridRow}>
            <label>Таймзона:</label>
            <TimeZoneSelector onSelect={setTimeZoneId} />
          </div>

          <button
            type="submit"
            className="button"
            disabled={loading}
          >
            Зарегистрироваться
          </button>
        </form>

        <p className={styles.gridFooter}>
          После регистрации вы будете авторизованы автоматически.
        </p>
      </div>
    </div>
  );
}

export default Register;

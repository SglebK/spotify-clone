import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from "./Register.module.css";
import api from "@api/axios";
import { useError } from "@context/ErrorContext.jsx";
import { useAuth } from "@context/AuthContext.jsx";
function Register() {
  const navigate = useNavigate();
  const { showError } = useError();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
      await api.post("/api/auth/register", {
        email: emailInput,
        password,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
      });
      await login(emailInput, password);
      navigate("/");
    } catch (err) {
      showError(err.response?.data?.error || "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className={styles.grid3}>
      <div className={styles.gridLogin}>
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
          <button
            type="submit"
            className="button"
            disabled={loading}
          >
            Зарегистрироваться
          </button>
        </form>
        <p className={styles.gridFooter}>
          После регистрации вход выполнится автоматически.
        </p>
      </div>
    </div>
  );
}
export default Register;

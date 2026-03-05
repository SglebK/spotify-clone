/* src/pages/configuration/Configuration.jsx */
import React, { useState } from 'react';
import styles from './Configuration.module.css';
import { useError } from '../../context/error/ErrorContext.jsx';

function Configuration({ theme, setTheme }) {
  const { showError } = useError();
  const [loading, setLoading] = useState(false);

  const changeTheme = async (e) => {
    const newTheme = e.target.value;

    setLoading(true);
    try {
      setTheme(newTheme);
      showError(" "); //  через showError
    } catch {
      showError("Ошибка сохранения настроек");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.settings} ${theme}`}>
      <h2>Настройки</h2>

      <div className={styles.themeSelector}>
        <label>
          <input
            type="radio"
            name="theme"
            value="light"
            checked={theme === "light"}
            onChange={changeTheme}
            disabled={loading}
          />
          Светлая тема
        </label>

        <label>
          <input
            type="radio"
            name="theme"
            value="dark"
            checked={theme === "dark"}
            onChange={changeTheme}
            disabled={loading}
          />
          Тёмная тема
        </label>
      </div>
    </div>
  );
}

export default Configuration;

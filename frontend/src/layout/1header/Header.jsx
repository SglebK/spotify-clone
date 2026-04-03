import React from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import icon1 from "@assets/images/icon1.png";
import icon2 from "@assets/images/icon2.png";
import { useAuth } from "@context/AuthContext.jsx";
import { sanitize } from "@helpers/sanitize";
import { useUI } from "@context/UIContext.jsx";
import { useSearch } from "@context/SearchContext.jsx";
function Header({ theme }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toggleMenu } = useUI();
  const { searchQuery, setSearchQuery } = useSearch();
  const iconA = theme === "dark" ? icon1 : icon2;
  const isAuthenticated = !!user;
  const email = user?.email ? sanitize(user.email) : "";
  const handleChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    navigate(`/search?q=${encodeURIComponent(value)}`);
  };
  return (
    <header className={`${styles.grid1} ${theme}`}>
      <div className={styles.grid11}>
        <Link
          to="/"
          onClick={() => setSearchQuery("")}
        >
          <img src={iconA} alt="Главная" className={styles.Icon} />
        </Link>
      </div>
      <div className={styles.grid12}>
        <input
          type="text"
          placeholder="Что хочешь включить?"
          value={searchQuery}
          onChange={handleChange}
          className={styles.searchInput}
        />
      </div>
      <div className={styles.grid13}>
        <div className={styles.menuMobile} onClick={toggleMenu}>
          Меню
        </div>
        <div className={styles.grid131}>
          {isAuthenticated ? (
            <div className={styles.userMeta}>
              <span className={styles.emailText}>{email}</span>
              {user?.isAdmin && (
                <span className={styles.adminBadge}>Админ</span>
              )}
            </div>
          ) : (
            <button
              className={styles.buttonUnified}
              onClick={() => navigate("/register")}
            >
              Зарегистрироваться
            </button>
          )}
        </div>
        <div className={styles.grid132}>
          {isAuthenticated ? (
            <button
              className={styles.buttonUnified}
              onClick={() => logout(navigate)}
            >
              Выйти
            </button>
          ) : (
            <button
              className={styles.buttonUnified}
              onClick={() => navigate("/login")}
            >
              Войти
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
export default Header;

// src/layout/1header/Header.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import icon1 from '../../assets/images/icon1.png';
import icon2 from '../../assets/images/icon2.png';
import icon3 from '../../assets/images/icon3.png';
import icon4 from '../../assets/images/icon4.png';
import icon5 from '../../assets/images/icon5.png';
import icon6 from '../../assets/images/icon6.png';
import { useAuth } from '../../context/auth/AuthContext.jsx';
import { sanitize } from '../../components/utils/sanitize/sanitize';
import { fixUrl } from '../../components/utils/fixUrl/fixUrl';

function Header({ theme, searchQuery, setSearchQuery, currentTrack }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const iconA = theme === 'dark' ? icon1 : icon2;
  const iconB = theme === 'dark' ? icon3 : icon4;
  const iconC = theme === 'dark' ? icon5 : icon6;
  const isAuthenticated = !!user;

  const email = user?.email ? sanitize(user.email) : "";

  const handleDownload = () => {
    if (!currentTrack?.audioUrl) {
      alert("Сначала выберите трек для скачивания");
      return;
    }

    const link = document.createElement("a");
    link.href = fixUrl(currentTrack.audioUrl);
    link.download = `${currentTrack.title || "track"}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`${styles.grid1} ${theme}`}>
      <div className={styles.grid11}>
        <div className={styles.grid111}>
          <Link to="/">
            <img src={iconA} alt="Главная" className={styles.Icon} />
          </Link>
        </div>
        <div className={styles.grid112}>
          <Link to="/">
            <img src={iconB} alt="Главная" className={styles.Icon} />
          </Link>
        </div>
      </div>

      <div className={styles.grid12}>
        <div className={styles.grid121}>
          <input
            type="text"
            placeholder="  Что хочешь включить?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`input ${styles.searchInput}`}
          />
        </div>
          <div className={styles.grid122}>
            <Link to="/">
              <img src={iconC} alt="Главная" className={styles.Icon} />
            </Link>
          </div>
      </div>

      <div className={styles.grid13}>
        <div className={styles.grid131}>
          <Link to="/premium" className="link">
            Premium
          </Link>
        </div>
        <div className={styles.grid132}>
          <Link to="/help" className="link">
            Справка
          </Link>
        </div>
        <div className={styles.grid132}>
          <button className={styles.topLinkButton} onClick={handleDownload}>
            Скачать
          </button>
        </div>
      </div>
      

      <div className={styles.grid14}>
        <div className={styles.grid141}>
          <h4>{isAuthenticated ? email : ( <button className={`button ${styles.logButton}`} onClick={() => navigate('/register')} > Зарегистрироваться </button> )}</h4>
        </div>

        <div className={styles.grid142}>
          <div className={styles.gridUserRow}>
            {isAuthenticated ? (
              <>
                {user?.isAdmin && (
                  <span className={styles.roleBadge}>А</span>
                )}

                <button className={`button ${styles.logButton}`} onClick={() => logout(navigate)}>
                  Выйти
                </button>
              </>
            ) : (
              <button
                className={`button ${styles.logButton}`} 
                onClick={() => navigate('/login')}
              >
                Войти
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;

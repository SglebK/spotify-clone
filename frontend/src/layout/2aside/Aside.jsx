import React from "react";
import { Link } from "react-router-dom";
import styles from "./Aside.module.css";
import { useAuth } from "@context/AuthContext.jsx";
import { useUI } from "@context/UIContext.jsx";
function Aside({ theme }) {
  const { user } = useAuth();
  const { menuOpen, closeMenu } = useUI();
  return (
    <aside className={`${styles.aside} ${menuOpen ? styles.open : ""} ${styles[theme]}`}>
      <div className={styles.grid2}>
        <div className={styles.grid21}>
          <Link to="/" className="button" onClick={closeMenu}>
            Главная
          </Link>
        </div>
        <div className={styles.grid22}>
          <Link to="/page0" className="button" onClick={closeMenu}>
            Все треки
          </Link>
        </div>
        <div className={styles.grid23}>
          <Link to="/playlists" className="button" onClick={closeMenu}>
            Все плейлисты
          </Link>
        </div>
        <div className={styles.divider1}></div>
        <div className={styles.grid24}>
          <Link to="/configuration" className="button" onClick={closeMenu}>
            Настройки
          </Link>
        </div>
        <div className={styles.divider2}></div>
        {user && (
          <>
            <div className={styles.grid25}>
              <Link to="/myPlaylists" className="button" onClick={closeMenu}>
                Мои плейлисты
              </Link>
            </div>
            <div className={styles.grid26}>
              <Link to="/upload-track" className="button" onClick={closeMenu}>
                Загрузить трек
              </Link>
            </div>
            <div className={styles.grid27}>
              <Link to="/myUploads" className="button" onClick={closeMenu}>
                Мои треки
              </Link>
            </div>
            <div className={styles.grid28}>
              <Link to="/favorites" className="button" onClick={closeMenu}>
                Любимые
              </Link>
            </div>
            <div className={styles.grid29}>
              <Link to="/trimAudio" className="button" onClick={closeMenu}>
                Обрезка аудио
              </Link>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
export default Aside;

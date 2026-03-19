// src/layout/2aside/Aside.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Aside.module.css';
import { useAuth } from '../../context/auth/AuthContext.jsx';

function Aside({ theme }) {
    const { user } = useAuth(); // получаем авторизацию

    return (
        <aside className={`${styles.grid2} ${styles[theme]}`}>
            <div className={styles.grid21}>
                <Link to="/" className="button">Главная</Link>
            </div>

            <div className={styles.grid22}>
                <Link to="/page0" className="button">Все треки</Link>
            </div>

            <div className={styles.grid23}>
                <Link to="/playlists" className="button">Все плейлисты</Link>
            </div>

            <div className={styles.divider1}></div>

            <div className={styles.grid24}>
                <Link to="/configuration" className="button">Настройки</Link>
            </div>
            
            <div className={styles.divider2}></div>

                        {/* Страница 2 — только для авторизованных */}
            
            {user && (
                <div className={styles.grid25}>
                    <Link to="/myPlaylists" className="button">Мои плейлисты</Link>
                </div>
            )}
            {user && (
                <div className={styles.grid26}>
                    <Link to="/upload-track" className="button">Загрузить трек</Link>
                </div>
            )}
            {user && (
                <div className={styles.grid27}>
                    <Link to="/myUploads" className="button">Мои треки</Link>
                </div>
            )}

        </aside>
    );
}

export default Aside;

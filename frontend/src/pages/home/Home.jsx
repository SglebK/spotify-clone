import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.module.css';

function Home() {
    return (
        <div className={styles.home}>
            <div className={styles.hero}>
                <p className={styles.kicker}>Музыка, плейлисты и свои загрузки</p>
                <h1>Ваша музыкальная библиотека в одном месте</h1>
                <p className={styles.subtitle}>
                    Слушайте треки, собирайте плейлисты, загружайте свои песни и быстро
                    переключайтесь между общим каталогом и личной медиатекой.
                </p>
            </div>

            <div className={styles.sections}>
                <Link to="/page0" className={styles.card}>
                    <h3>Все треки</h3>
                    <p>Общий каталог доступных треков для прослушивания и добавления в очередь.</p>
                </Link>

                <Link to="/playlists" className={styles.card}>
                    <h3>Все плейлисты</h3>
                    <p>Публичные плейлисты пользователей, которые можно открыть и слушать целиком.</p>
                </Link>

                <Link to="/myUploads" className={styles.card}>
                    <h3>Мои треки</h3>
                    <p>Ваши личные загрузки: редактирование, добавление в плейлисты и любимые.</p>
                </Link>

                <Link to="/myPlaylists" className={styles.card}>
                    <h3>Мои плейлисты</h3>
                    <p>Личные подборки с возможностью настройки названия, описания и обложки.</p>
                </Link>
            </div>
        </div>
    );
}

export default Home;


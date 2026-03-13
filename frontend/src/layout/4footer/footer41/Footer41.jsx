// src/layout/4footer/footer41/Footer41.jsx

import React from 'react';
import styles from './Footer41.module.css';
import { fixUrl } from '../../../components/utils/fixUrl/fixUrl';

function Footer41({ track }) {

    return (
        <div className={styles.grid41}>
            <div className={styles.grid411}>

                {/* ⭐ Обложка */}
                <div className={styles.grid4111}>
                    {track ? (
                        <img
                            src={fixUrl(track.coverUrl) || "/default-cover.png"}
                            alt={track.title}
                            className={styles.cover}
                        />
                    ) : (
                        <div className={styles.cover}></div>
                    )}
                </div>

                {/* ⭐ Название и артист */}
                <div className={styles.grid4112}>
                    <p className={styles.grid41121}>
                        {track?.title || "Нет трека"}
                    </p>
                    <p className={styles.grid41122}>
                        {track?.artist || "Выберите трек"}
                    </p>
                </div>

            </div>
        </div>
    );
}

export default Footer41;

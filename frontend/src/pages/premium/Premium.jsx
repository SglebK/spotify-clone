import React from "react";
import styles from "./Premium.module.css";

function Premium() {
    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h2>Premium скоро появится</h2>
                <p>
                    Пока в этой версии доступен основной музыкальный функционал:
                    загрузка треков, плейлисты, любимые треки и встроенный плеер.
                </p>
                <p>
                    Отдельные премиум-возможности мы пока не включали, чтобы
                    сначала довести базовый сервис до удобного состояния.
                </p>
            </div>
        </div>
    );
}

export default Premium;

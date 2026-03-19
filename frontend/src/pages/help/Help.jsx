import React from "react";
import styles from "./Help.module.css";

function Help() {
    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h2>Справка</h2>
                <ul className={styles.list}>
                    <li>Чтобы слушать треки, откройте раздел "Все треки" или "Все плейлисты".</li>
                    <li>Свои треки можно загрузить в разделе "Загрузить трек".</li>
                    <li>В "Мои треки" можно менять название, обложку и добавлять треки в плейлисты.</li>
                    <li>В "Мои плейлисты" можно редактировать плейлист и слушать его целиком.</li>
                    <li>Кнопка "Скачать" вверху скачивает текущий выбранный трек.</li>
                </ul>
            </div>
        </div>
    );
}

export default Help;

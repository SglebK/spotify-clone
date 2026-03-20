// src/pages/myUploads/myUploadsLeft/MyUploadsLeft.jsx
import React from "react";
import styles from "./MyUploadsLeft.module.css";
import { fixUrl } from "../../../components/utils/fixUrl/fixUrl";

function MyUploadsLeft({ myTracks, loading, selectedTrack, onSelectTrack, onPlayTrack }) {
    return (
        <div className={styles.left}>

            <h2 className={styles.title}>Мои загруженные треки</h2>
            <p className={styles.helper}>Открывайте трек кнопкой ниже, чтобы редактировать его справа.</p>

            {loading && <p className={styles.info}>Загрузка...</p>}

            {!loading && myTracks.length === 0 && (
                <p className={styles.info}>Вы ещё не загружали треки</p>
            )}

            {!loading && myTracks.length > 0 && (
                <ul className={styles.list}>
                    {myTracks.map((t) => (
                        <li
                            key={t.id}
                            className={`${styles.item} ${
                                selectedTrack && selectedTrack.id === t.id
                                    ? styles.active
                                    : ""
                            }`}
                        >
                            <img
                                src={fixUrl(t.coverUrl) || "/default-cover.png"}
                                alt={t.title}
                                className={styles.cover}
                            />
                            <div className={styles.trackText}>
                                <span className={styles.trackTitle}>{t.title}</span>
                                <span className={styles.trackArtist}>{t.artist}</span>
                            </div>
                            <div className={styles.actions}>
                                <button
                                    type="button"
                                    className={styles.actionButton}
                                    onClick={() => onSelectTrack(t)}
                                >
                                    Открыть
                                </button>
                                <button
                                    type="button"
                                    className={styles.actionButton}
                                    onClick={() => onPlayTrack?.(t)}
                                >
                                    Слушать
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

        </div>
    );
}

export default MyUploadsLeft;

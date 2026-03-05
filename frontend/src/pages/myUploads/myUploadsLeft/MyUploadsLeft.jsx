// src/pages/myUploads/myUploadsLeft/MyUploadsLeft.jsx
import React from "react";
import styles from "./MyUploadsLeft.module.css";

function MyUploadsLeft({ myTracks, loading, selectedTrack, onSelectTrack }) {
    return (
        <div className={styles.left}>

            <h2 className={styles.title}>Мои загруженные треки</h2>

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
                            onClick={() => onSelectTrack(t)}
                        >
                            <span className={styles.trackTitle}>{t.title}</span>
                            <span className={styles.trackArtist}>{t.artist}</span>
                        </li>
                    ))}
                </ul>
            )}

        </div>
    );
}

export default MyUploadsLeft;

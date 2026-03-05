// src/pages/page0/Page0.jsx
import React, { useEffect, useState } from "react";
import styles from "./Page0.module.css";
import Toast from "../../components/toast/Toast.jsx";
import { API_URL } from "../../components/utils/api/config";

function Page0({ onSelectTrack, tracks, setTracks, setPlaylistName }) {
    const [serverTracks, setServerTracks] = useState([]);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetch(`${API_URL}/api/tracks`)
            .then(res => res.json())
            .then(data => setServerTracks(data))
            .catch(err => console.error("Ошибка загрузки треков:", err));
    }, []);

    const addToPlaylist = (track) => {
        const exists = tracks.some(t => t.id === track.id);

        if (exists) {
            setToast("Трек уже в плейлисте");
            setTimeout(() => setToast(null), 2000);
            return;
        }

        // ⭐ Сбрасываем название — это новый временный плейлист
        setPlaylistName(null);

        // ⭐ Добавляем трек в плейлист
        setTracks(prev => [...prev, track]);

        // ⭐ Делаем трек текущим
        onSelectTrack(track);

        setToast("Добавлено в плейлист");
        setTimeout(() => setToast(null), 2000);
    };

    return (
        <div className={styles.page}>
            <h2 className={styles.title}>Сидированные треки</h2>

            <div className={styles.grid}>
                {serverTracks.map(track => (
                    <div key={track.id} className={styles.card}>

                        {/* ⭐ Плюсик в углу */}
                        <button
                            className={styles.plusBtn}
                            onClick={(e) => {
                                e.stopPropagation();
                                addToPlaylist(track);
                            }}
                        >
                            +
                        </button>

                        <img 
                            src={track.coverUrl || "/default-cover.png"} 
                            alt={track.title} 
                            className={styles.cover}
                            onClick={() => onSelectTrack(track)}
                        />

                        <p className={styles.trackTitle}>{track.title}</p>
                        <p className={styles.artist}>{track.artist}</p>
                    </div>
                ))}
            </div>

            {/* ⭐ Toast уведомление */}
            {toast && <Toast message={toast} />}
        </div>
    );
}

export default Page0;

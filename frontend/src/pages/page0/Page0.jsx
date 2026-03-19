// src/pages/page0/Page0.jsx
import React, { useEffect, useState } from "react";
import styles from "./Page0.module.css";
import Toast from "../../components/toast/Toast.jsx";
import { API_URL } from "../../components/utils/api/config";
import { fixUrl } from "../../components/utils/fixUrl/fixUrl";

function Page0({ onSelectTrack, tracks, setTracks, setPlaylistName, searchQuery }) {
    const [serverTracks, setServerTracks] = useState([]);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        let active = true;

        const loadTracks = () => {
            fetch(`${API_URL}/api/tracks`)
                .then(async (res) => {
                    if (!res.ok) {
                        throw new Error(`Ошибка загрузки: ${res.status}`);
                    }
                    return res.json();
                })
                .then(data => {
                    if (active) setServerTracks(data);
                })
                .catch(err => console.error("Ошибка загрузки треков:", err));
        };

        loadTracks();
        const intervalId = setInterval(loadTracks, 12000);

        return () => {
            active = false;
            clearInterval(intervalId);
        };
    }, []);

    const addToPlaylist = (track) => {
        const preparedTrack = {
            ...track,
            audioUrl: fixUrl(track.audioUrl),
            coverUrl: fixUrl(track.coverUrl)
        };

        const exists = tracks.some(t => t.id === preparedTrack.id);

        if (exists) {
            setToast("Трек уже в плейлисте");
            setTimeout(() => setToast(null), 2000);
            return;
        }

        // ⭐ Сбрасываем название — это новый временный плейлист
        setPlaylistName(null);

        setTracks(prev => [...prev, preparedTrack]);

        onSelectTrack(preparedTrack);

        setToast("Добавлено в плейлист");
        setTimeout(() => setToast(null), 2000);
    };

    return (
        <div className={styles.page}>
            <h2 className={styles.title}>Сидированные треки</h2>

            <div className={styles.grid}>
                {serverTracks
                    .filter((track) => {
                        const query = searchQuery?.trim().toLowerCase();
                        if (!query) return true;
                        return (
                            track.title?.toLowerCase().includes(query) ||
                            track.artist?.toLowerCase().includes(query)
                        );
                    })
                    .map(track => (
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
                            src={fixUrl(track.coverUrl) || "/default-cover.png"} 
                            alt={track.title} 
                            className={styles.cover}
                            onClick={() =>
                                onSelectTrack({
                                    ...track,
                                    audioUrl: fixUrl(track.audioUrl),
                                    coverUrl: fixUrl(track.coverUrl)
                                })
                            }
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

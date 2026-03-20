// src/pages/page0/Page0.jsx
import React, { useEffect, useState } from "react";
import styles from "./Page0.module.css";
import Toast from "../../components/toast/Toast.jsx";
import { API_URL } from "../../components/utils/api/config";
import { fixUrl } from "../../components/utils/fixUrl/fixUrl";
import TrackFilters from "../../components/trackFilters/TrackFilters.jsx";
import { useError } from "../../context/error/ErrorContext.jsx";
import { useAuth } from "../../context/auth/AuthContext.jsx";
import { authFetch } from "../../components/utils/api/authFetch.js";

function Page0({ onSelectTrack, tracks, setTracks, setPlaylistName, searchQuery }) {
    const [serverTracks, setServerTracks] = useState([]);
    const [toast, setToast] = useState(null);
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");
    const [type, setType] = useState("all");
    const { showError } = useError();
    const { user } = useAuth();

    useEffect(() => {
        let active = true;

        const loadTracks = () => {
            const params = new URLSearchParams({
                search: searchQuery?.trim() || "",
                sortBy,
                sortOrder,
                type
            });

            fetch(`${API_URL}/api/tracks?${params.toString()}`)
                .then(async (res) => {
                    if (!res.ok) {
                        throw new Error(`Ошибка загрузки: ${res.status}`);
                    }
                    return res.json();
                })
                .then(data => {
                    if (active) setServerTracks(data);
                })
                .catch(err => {
                    console.error("Ошибка загрузки треков:", err);
                    showError("Не удалось загрузить список треков");
                });
        };

        loadTracks();
        const intervalId = setInterval(loadTracks, 12000);

        return () => {
            active = false;
            clearInterval(intervalId);
        };
    }, [searchQuery, sortBy, sortOrder, type, showError]);

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

        setToast("Добавлено в плейлист");
        setTimeout(() => setToast(null), 2000);
    };

    const playTrack = (track) => {
        onSelectTrack({
            ...track,
            audioUrl: fixUrl(track.audioUrl),
            coverUrl: fixUrl(track.coverUrl)
        });
    };

    const deleteTrack = async (trackId) => {
        if (!user?.isAdmin) return;
        if (!confirm("Удалить этот трек из общего каталога?")) return;

        try {
            const res = await authFetch(`${API_URL}/api/tracks/${trackId}`, {
                method: "DELETE"
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Не удалось удалить трек");
            }

            setServerTracks((prev) => prev.filter((item) => item.id !== trackId));
            setToast("Трек удалён");
            setTimeout(() => setToast(null), 2000);
        } catch (error) {
            showError(error.message || "Не удалось удалить трек");
        }
    };

    return (
        <div className={styles.page}>
            <h2 className={styles.title}>Все треки</h2>

            <TrackFilters
                title="Фильтрация и сортировка каталога"
                sortBy={sortBy}
                setSortBy={setSortBy}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                type={type}
                setType={setType}
                typeOptions={[
                    { value: "all", label: "Все треки" },
                    { value: "seeded", label: "Сидированные" },
                    { value: "uploaded", label: "Пользовательские" }
                ]}
            />

            <div className={styles.grid}>
                {serverTracks.map(track => (
                    <div key={track.id} className={styles.card}>
                        <img 
                            src={fixUrl(track.coverUrl) || "/default-cover.png"} 
                            alt={track.title} 
                            className={styles.cover}
                        />

                        <p className={styles.trackTitle}>{track.title}</p>
                        <p className={styles.artist}>{track.artist}</p>

                        <div className={styles.actions}>
                            <button
                                className={`button ${styles.cardButton}`}
                                onClick={() => playTrack(track)}
                            >
                                Слушать
                            </button>

                            <button
                                className={`button ${styles.cardButton}`}
                                onClick={() => addToPlaylist(track)}
                            >
                                В очередь
                            </button>

                            {user?.isAdmin && (
                                <button
                                    className={`button ${styles.cardButton} ${styles.deleteButton}`}
                                    onClick={() => deleteTrack(track.id)}
                                >
                                    Удалить
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* ⭐ Toast уведомление */}
            {toast && <Toast message={toast} />}
        </div>
    );
}

export default Page0;

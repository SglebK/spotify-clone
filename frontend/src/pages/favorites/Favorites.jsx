import React, { useEffect, useState } from "react";
import styles from "./Favorites.module.css";
import { API_URL } from "../../components/utils/api/config";
import { useAuth } from "../../context/auth/AuthContext";
import { useError } from "../../context/error/ErrorContext.jsx";
import { fixUrl } from "../../components/utils/fixUrl/fixUrl";
import Toast from "../../components/toast/Toast.jsx";
import TrackFilters from "../../components/trackFilters/TrackFilters.jsx";
import { authFetch } from "../../components/utils/api/authFetch.js";

function Favorites({ onPlayTrack, tracks, setTracks, setPlaylistName }) {
    const { accessToken } = useAuth();
    const { showError } = useError();
    const [favorites, setFavorites] = useState([]);
    const [selectedTrack, setSelectedTrack] = useState(null);
    const [toast, setToast] = useState(null);
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");
    const [type, setType] = useState("all");

    useEffect(() => {
        let active = true;

        const loadFavorites = async () => {
            try {
                const params = new URLSearchParams({
                    sortBy,
                    sortOrder,
                    type
                });

                const res = await authFetch(`${API_URL}/api/playlists/favorites?${params.toString()}`);

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Не удалось загрузить любимые треки");
                }

                if (!active) return;

                const nextTracks = data.tracks || [];
                setFavorites(nextTracks);
                setSelectedTrack((prev) => prev ? nextTracks.find((item) => item.id === prev.id) || null : nextTracks[0] || null);
            } catch (error) {
                console.error("Ошибка favorites:", error);
                showError(error.message || "Не удалось загрузить любимые треки");
            }
        };

        loadFavorites();
        const intervalId = setInterval(loadFavorites, 12000);
        const handleLibraryChanged = () => loadFavorites();
        window.addEventListener("library:changed", handleLibraryChanged);

        return () => {
            active = false;
            clearInterval(intervalId);
            window.removeEventListener("library:changed", handleLibraryChanged);
        };
    }, [accessToken, sortBy, sortOrder, type, showError]);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 2200);
    };

    const addToQueue = () => {
        if (!selectedTrack) return;

        const preparedTrack = {
            ...selectedTrack,
            audioUrl: fixUrl(selectedTrack.audioUrl),
            coverUrl: fixUrl(selectedTrack.coverUrl)
        };

        if (tracks.some((item) => item.id === preparedTrack.id)) {
            showToast("Трек уже есть в очереди");
            return;
        }

        setPlaylistName("Любимые треки");
        setTracks((prev) => [...prev, preparedTrack]);
        showToast("Трек добавлен в очередь");
    };

    const playFavorite = (track) => {
        const preparedQueue = favorites.map((item) => ({
            ...item,
            audioUrl: fixUrl(item.audioUrl),
            coverUrl: fixUrl(item.coverUrl)
        }));

        setTracks(preparedQueue);
        setPlaylistName("Любимые треки");

        const preparedTrack = preparedQueue.find((item) => item.id === track.id) || preparedQueue[0];
        if (preparedTrack) onPlayTrack(preparedTrack);
    };

    const removeFavorite = async () => {
        if (!selectedTrack) return;

        try {
            const res = await authFetch(`${API_URL}/api/playlists/favorites/tracks/${selectedTrack.id}`, {
                method: "DELETE"
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Не удалось удалить трек из любимых");
            }

            setFavorites((prev) => prev.filter((item) => item.id !== selectedTrack.id));
            setSelectedTrack(null);
            showToast("Трек удалён из любимых");
        } catch (error) {
            console.error("Ошибка удаления из любимых:", error);
            showError(error.message || "Не удалось удалить трек из любимых");
        }
    };

    return (
        <div className={styles.page}>
            <TrackFilters
                title="Любимые треки"
                sortBy={sortBy}
                setSortBy={setSortBy}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                type={type}
                setType={setType}
                typeOptions={[
                    { value: "all", label: "Все" },
                    { value: "seeded", label: "Сидированные" },
                    { value: "uploaded", label: "Пользовательские" },
                    { value: "public", label: "Публичные" },
                    { value: "private", label: "Приватные" }
                ]}
            />

            <div className={styles.layout}>
                <div className={styles.sidebar}>
                    <h2 className={styles.title}>Список избранного</h2>

                    {favorites.length === 0 && (
                        <p className={styles.info}>У вас пока нет любимых треков.</p>
                    )}

                    <div className={styles.list}>
                        {favorites.map((track) => (
                            <button
                                key={track.id}
                                type="button"
                                className={`${styles.item} ${selectedTrack?.id === track.id ? styles.active : ""}`}
                                onClick={() => setSelectedTrack(track)}
                            >
                                <img
                                    src={fixUrl(track.coverUrl) || "/default-cover.png"}
                                    alt={track.title}
                                    className={styles.cover}
                                />
                                <span className={styles.text}>
                                    <span className={styles.trackTitle}>{track.title}</span>
                                    <span className={styles.trackArtist}>{track.artist}</span>
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.details}>
                    {!selectedTrack && <p className={styles.info}>Выберите трек слева.</p>}

                    {selectedTrack && (
                        <>
                            <img
                                src={fixUrl(selectedTrack.coverUrl) || "/default-cover.png"}
                                alt={selectedTrack.title}
                                className={styles.heroCover}
                            />
                            <h3 className={styles.heroTitle}>{selectedTrack.title}</h3>
                            <p className={styles.heroArtist}>{selectedTrack.artist}</p>

                            <div className={styles.actions}>
                                <button className="button" onClick={() => playFavorite(selectedTrack)}>
                                    Слушать
                                </button>
                                <button className="button" onClick={addToQueue}>
                                    В очередь
                                </button>
                                <button className="button" onClick={removeFavorite}>
                                    Убрать из любимых
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {toast && <Toast message={toast} />}
        </div>
    );
}

export default Favorites;

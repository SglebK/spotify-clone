import React, { useEffect, useState } from "react";
import styles from "./Favorites.module.css";
import api from "@api/axios";
import { useAuth } from "@context/AuthContext";
import { useError } from "@context/ErrorContext.jsx";
import { fixUrl } from "@helpers/fixUrl";
import TrackFilters from "@components/trackFilters/TrackFilters.jsx";
import TrackCard from "@components/trackCard/TrackCard.jsx";
import TrackModal from "@components/trackModal/TrackModal.jsx";
import QuickSaveModal from "@components/quickSaveModal/QuickSaveModal.jsx";
import Toast from "@components/toast/Toast.jsx";
import { libraryEvents } from "@helpers/libraryEvents";
function Favorites({ onPlayTrack, setTracks }) {
    const { user, accessToken, loading } = useAuth();
    const { showError } = useError();
    const [allFavorites, setAllFavorites] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [selectedTrack, setSelectedTrack] = useState(null);
    const [toast, setToast] = useState(null);
    const [activeTab, setActiveTab] = useState("public");
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");
    const [type, setType] = useState("all");
    const [quickSaveTrack, setQuickSaveTrack] = useState(null);
    const [showQuickSave, setShowQuickSave] = useState(false);
    if (loading) return null;
    if (!accessToken) return null;
    useEffect(() => {
        let active = true;
        const loadFavorites = async () => {
            try {
                const params = {
                    sortBy,
                    sortOrder,
                    type
                };
                const { data } = await api.get("/api/playlists/favorites", { params });
                if (!active) return;
                const prepared = (data.tracks || []).map(t => ({
                    ...t,
                    audioUrl: fixUrl(t.audioUrl),
                    coverUrl: fixUrl(t.coverUrl)
                }));
                setAllFavorites(prepared);
            } catch (err) {
                showError(err.response?.data?.error || "Не удалось загрузить любимые треки");
            }
        };
        loadFavorites();
        const intervalId = setInterval(loadFavorites, 12000);
        return () => {
            active = false;
            clearInterval(intervalId);
        };
    }, [accessToken, sortBy, sortOrder, type, showError]);
    useEffect(() => {
        const reload = () => {
            setSortOrder(prev => (prev === "desc" ? "asc" : "desc"));
            setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
        };
        const unsubscribe = libraryEvents.on("favorites", reload);
        return unsubscribe;
    }, []);
    useEffect(() => {
        if (!user) return;
        if (activeTab === "public") {
            setFiltered(allFavorites.filter(t => t.isPublic === true));
        } else {
            setFiltered(allFavorites.filter(t => t.userId === user.id));
        }
        setSelectedTrack(null);
    }, [activeTab, allFavorites, user]);
    const handlePlayTrack = (track) => {
        if (!track) return;
        onPlayTrack({
            ...track,
            audioUrl: fixUrl(track.audioUrl),
            coverUrl: fixUrl(track.coverUrl)
        });
    };
    const addToPlaylist = (track) => {
        const prepared = {
            ...track,
            audioUrl: fixUrl(track.audioUrl),
            coverUrl: fixUrl(track.coverUrl)
        };
        setTracks(prev => [...prev, prepared]);
        setToast("Добавлено в плейлист");
        setTimeout(() => setToast(null), 2000);
    };
    const deleteFavorite = async (track) => {
        try {
            await api.delete(`/api/playlists/favorites/tracks/${track.id}`);
            setAllFavorites(prev => prev.filter(t => t.id !== track.id));
            setSelectedTrack(null);
            setToast("Удалено из любимых");
            setTimeout(() => setToast(null), 2000);
        } catch (err) {
            showError(err.response?.data?.error || "Не удалось удалить из любимых");
        }
    };
    return (
        <div className={styles.page}>
            <div className={styles.topRow}>
                <div className={styles.filtersBox}>
                    <TrackFilters
                        title={activeTab === "public" ? "Публичные любимые" : "Мои любимые"}
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
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />
                </div>
            </div>
            <div className={styles.grid}>
                {filtered.map(track => (
                    <TrackCard
                        key={track.id}
                        track={track}
                        onOpen={() => setSelectedTrack(track)}
                    />
                ))}
            </div>
            {selectedTrack && (
                <div className="overlay" onClick={() => setSelectedTrack(null)}>
                    <TrackModal
                        track={selectedTrack}
                        onClose={() => setSelectedTrack(null)}
                        onPlay={handlePlayTrack}
                        onAdd={addToPlaylist}
                        onDelete={deleteFavorite}
                        user={user}
                        onAddToPlaylist={(track) => {
                            setQuickSaveTrack(track);
                            setShowQuickSave(true);
                            setSelectedTrack(null);
                        }}
                    />
                </div>
            )}
            {showQuickSave && (
                <QuickSaveModal
                    track={quickSaveTrack}
                    onClose={() => setShowQuickSave(false)}
                />
            )}
            {toast && <Toast message={toast} />}
        </div>
    );
}
export default Favorites;

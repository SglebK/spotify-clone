import React, { useEffect, useState } from "react";
import styles from "./Page0.module.css";
import api from "@api/axios";
import Toast from "@components/toast/Toast.jsx";
import { fixUrl } from "@helpers/fixUrl";
import TrackFilters from "@components/trackFilters/TrackFilters.jsx";
import TrackCard from "@components/trackCard/TrackCard.jsx";
import TrackModal from "@components/trackModal/TrackModal.jsx";
import QuickSaveModal from "@components/quickSaveModal/QuickSaveModal.jsx";
import { useError } from "@context/ErrorContext.jsx";
import { useAuth } from "@context/AuthContext.jsx";

function Page0({
    onSelectTrack,
    tracks,
    setTracks,
    setPlaylistName,
    searchQuery
}) {
    const [serverTracks, setServerTracks] = useState([]);
    const [toast, setToast] = useState(null);
    const [selectedTrack, setSelectedTrack] = useState(null);
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");
    const [type, setType] = useState("all");
    const { showError } = useError();
    const { user, loading } = useAuth();
    const [quickSaveTrack, setQuickSaveTrack] = useState(null);
    const [showQuickSave, setShowQuickSave] = useState(false);

    if (loading) return null;

    useEffect(() => {
        let active = true;
        const loadTracks = async () => {
            try {
                const params = {
                    search: searchQuery?.trim() || "",
                    sortBy,
                    sortOrder,
                    type
                };
                const { data } = await api.get("/api/tracks", { params });
                if (active) {
                    const prepared = data.map(t => ({
                        ...t,
                        audioUrl: fixUrl(t.audioUrl),
                        coverUrl: fixUrl(t.coverUrl)
                    }));
                    setServerTracks(prepared);
                }
            } catch (err) {
                console.error("Ошибка загрузки треков:", err);
                showError("Не удалось загрузить список треков");
            }
        };
        loadTracks();

        return () => {
            active = false;
        };
    }, [searchQuery, sortBy, sortOrder, type, showError]);
    const addToPlaylist = (track) => {
        const prepared = {
            ...track,
            audioUrl: fixUrl(track.audioUrl),
            coverUrl: fixUrl(track.coverUrl)
        };
        if (tracks.some(t => t.id === prepared.id)) {
            setToast("Трек уже в плейлисте");
            setTimeout(() => setToast(null), 2000);
            return;
        }
        setPlaylistName(null);
        setTracks(prev => [...prev, prepared]);

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
    const makeTrackPrivate = async (trackId) => {
        const track = serverTracks.find(t => t.id === trackId);
        if (!track) return;
        try {
            const isOwner = user && track.userId === user.id;

            if (isOwner && track.isPublic) {
                if (!confirm("Сделать этот трек приватным?")) return;
                await api.put(`/api/tracks/${trackId}`, {
                    isPublic: false
                });
                setServerTracks(prev => prev.filter(item => item.id !== trackId));
                setToast("Трек сделан приватным");
            } else if (user?.isAdmin) {
                if (!confirm("Удалить этот трек как админ?")) return;
                await api.delete(`/api/tracks/${trackId}`);
                setServerTracks(prev => prev.filter(item => item.id !== trackId));
                setToast("Трек удалён администратором");
            } else {
                return;
            }

            setTimeout(() => setToast(null), 2000);
        } catch (error) {
            showError(error.response?.data?.error || "Не удалось изменить статус трека");
        }
    };
    return (
        <div className={styles.page}>
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
                    <TrackCard
                        key={track.id}
                        track={track}
                        onOpen={() => setSelectedTrack(track)}
                    />
                ))}
            </div>
            {selectedTrack && (
                <div
                    className="overlay"
                    onClick={() => setSelectedTrack(null)}
                >
                    <TrackModal
                        track={selectedTrack}
                        onClose={() => setSelectedTrack(null)}
                        onPlay={playTrack}
                        onAdd={addToPlaylist}
                        onDelete={user ? makeTrackPrivate : undefined}
                        mode="catalog"
                        user={user}
                        onAddToPlaylist={(track) => {
                            setQuickSaveTrack(track);
                            setShowQuickSave(true);
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
export default Page0;

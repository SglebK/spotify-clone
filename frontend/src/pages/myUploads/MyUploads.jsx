import React, { useEffect, useState } from "react";
import styles from "./MyUploads.module.css";
import api from "@api/axios";
import { useAuth } from "@context/AuthContext";
import { fixUrl } from "@helpers/fixUrl";
import { useError } from "@context/ErrorContext.jsx";
import TrackFilters from "@components/trackFilters/TrackFilters.jsx";
import TrackCard from "@components/trackCard/TrackCard.jsx";
import TrackModal from "@components/trackModal/TrackModal.jsx";
import QuickSaveModal from "@components/quickSaveModal/QuickSaveModal.jsx";
import Toast from "@components/toast/Toast.jsx";
function MyUploads({ onPlayTrack, setTracks, searchQuery }) {
    const { user } = useAuth();
    const { showError } = useError();
    const [myTracks, setMyTracks] = useState([]);
    const [selectedTrack, setSelectedTrack] = useState(null);
    const [toast, setToast] = useState(null);
    const [quickSaveTrack, setQuickSaveTrack] = useState(null);
    const [showQuickSave, setShowQuickSave] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");
    const [type, setType] = useState("all");
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
                const { data } = await api.get("/api/tracks/my", { params });
                if (active) {
                    const prepared = data.map(t => ({
                        ...t,
                        audioUrl: fixUrl(t.audioUrl),
                        coverUrl: fixUrl(t.coverUrl)
                    }));
                    setMyTracks(prepared);
                }
            } catch (err) {
                showError("Не удалось загрузить ваши треки");
            } finally {
                if (active) setLoading(false);
            }
        };
        loadTracks();
        const intervalId = setInterval(loadTracks, 12000);
        return () => {
            active = false;
            clearInterval(intervalId);
        };
    }, [searchQuery, sortBy, sortOrder, type, showError]);
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
    const togglePublic = async (trackId) => {
        const track = myTracks.find(t => t.id === trackId);
        if (!track) return;
        try {
            const { data } = await api.put(`/api/tracks/${trackId}`, {
                isPublic: !track.isPublic
            });
            setMyTracks(prev =>
                prev.map(t =>
                    t.id === trackId ? { ...t, isPublic: data.isPublic } : t
                )
            );
            setSelectedTrack(prev =>
                prev && prev.id === trackId
                    ? { ...prev, isPublic: data.isPublic }
                    : prev
            );
            setToast(data.isPublic ? "Сделан публичным" : "Сделан приватным");
            setTimeout(() => setToast(null), 2000);
        } catch (err) {
            showError(err.response?.data?.error || "Не удалось изменить статус");
        }
    };
    const deleteTrack = async (trackId) => {
        if (!confirm("Удалить этот трек?")) return;
        try {
            await api.delete(`/api/tracks/${trackId}`);
            setMyTracks(prev => prev.filter(item => item.id !== trackId));
            setSelectedTrack(prev => (prev && prev.id === trackId ? null : prev));
            setToast("Трек удалён");
            setTimeout(() => setToast(null), 2000);
        } catch (error) {
            showError(error.response?.data?.error || "Не удалось удалить трек");
        }
    };
    return (
        <div className={styles.page}>
            <TrackFilters
                title="Ваши загруженные треки"
                sortBy={sortBy}
                setSortBy={setSortBy}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                type={type}
                setType={setType}
                typeOptions={[
                    { value: "all", label: "Все" },
                    { value: "public", label: "Публичные" },
                    { value: "private", label: "Приватные" }
                ]}
            />
            <div className={styles.grid}>
                {myTracks.map(track => (
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
                        onDelete={deleteTrack}
                        onTogglePublic={togglePublic}
                        mode="myUploads"
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
export default MyUploads;

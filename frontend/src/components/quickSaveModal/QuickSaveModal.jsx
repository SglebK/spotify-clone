import React, { useEffect, useMemo, useState } from "react";
import styles from "./QuickSaveModal.module.css";
import api from "@api/axios";

function QuickSaveModal({
    track,
    tracks,
    playlists: externalPlaylists,
    preferredPlaylistId = "",
    saveOnClose = false,
    onClose,
    onSaved
}) {
    const trackList = useMemo(() => {
        const list = Array.isArray(tracks) ? tracks : track ? [track] : [];
        return list.filter(t => t?.id);
    }, [track, tracks]);

    const [playlists, setPlaylists] = useState([]);
    const [selectedId, setSelectedId] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [newTitle, setNewTitle] = useState("");

    useEffect(() => {
        if (!trackList.length) return;

        if (externalPlaylists?.length) {
            setPlaylists(externalPlaylists);
            return;
        }

        const load = async () => {
            try {
                const { data } = await api.get("/api/playlists/my");
                setPlaylists(data || []);
            } catch (err) {
                console.error("Ошибка загрузки плейлистов:", err);
            }
        };

        load();
    }, [externalPlaylists, trackList.length]);

    const orderedPlaylists = useMemo(() => {
        const fav = playlists.filter(p => p.isFavorites);
        const reg = playlists.filter(p => !p.isFavorites);
        return [...fav, ...reg];
    }, [playlists]);

    useEffect(() => {
        const fav = playlists.find(p => p.isFavorites);
        setSelectedId(preferredPlaylistId || fav?.id || playlists[0]?.id || "");
    }, [playlists, preferredPlaylistId]);

    const saveToPlaylist = async (playlistId) => {
        if (!playlistId || !trackList.length) return;

        try {
            for (const t of trackList) {
                if (!t?.id) continue;
                await api.post("/api/playlist-tracks", {
                    playlistId,
                    trackId: t.id
                });
            }
        } catch (err) {
            console.error("Ошибка добавления треков:", err);
        }

        onSaved?.(playlistId);
        onClose?.();
    };

    const handleCreate = async () => {
        if (!newTitle.trim()) return;

        try {
            const { data } = await api.post("/api/playlists", {
                title: newTitle.trim()
            });

            if (data?.id) {
                setPlaylists(prev => [...prev, data]);
                await saveToPlaylist(data.id);
            }
        } catch (err) {
            console.error("Ошибка создания плейлиста:", err);
        }
    };

    const handleClose = async () => {
        if (saveOnClose && selectedId) {
            await saveToPlaylist(selectedId);
            return;
        }

        onClose?.();
    };

    if (!trackList.length) return null;

    return (
        <div className={styles.overlay} onClick={handleClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <div>
                        <h3 className={styles.title}>
                            {trackList.length === 1
                                ? "Сохранить трек"
                                : `Сохранить очередь (${trackList.length})`}
                        </h3>
                        <p className={styles.subtitle}>
                            {trackList.length === 1
                                ? "По умолчанию трек сохранится в любимые. Можно выбрать другой плейлист."
                                : "Все треки очереди будут добавлены в выбранный плейлист."}
                        </p>
                    </div>
                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={handleClose}
                    >
                        ×
                    </button>
                </div>
                <div className={styles.list}>
                    {orderedPlaylists.map((playlist) => (
                        <button
                            key={playlist.id}
                            type="button"
                            className={`${styles.item} ${selectedId === playlist.id ? styles.active : ""}`}
                            onClick={() => {
                                setSelectedId(playlist.id);
                                saveToPlaylist(playlist.id);
                            }}
                        >
                            <span className={styles.itemTitle}>
                                {playlist.isFavorites ? "Любимые треки" : playlist.title}
                            </span>
                            <span className={styles.itemMeta}>
                                {playlist.isFavorites
                                    ? "Сохранить сюда по умолчанию"
                                    : playlist.description || "Пользовательский плейлист"}
                            </span>
                        </button>
                    ))}
                </div>
                <div className={styles.createSection}>
                    <button
                        type="button"
                        className={styles.createToggle}
                        onClick={() => setIsCreating((prev) => !prev)}
                    >
                        +
                    </button>
                    {isCreating && (
                        <div className={styles.createBox}>
                            <input
                                type="text"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                className={`input ${styles.input}`}
                                placeholder="Новый плейлист"
                            />
                            <button
                                type="button"
                                className={`button ${styles.saveButton}`}
                                onClick={handleCreate}
                            >
                                Сохранить
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default QuickSaveModal;

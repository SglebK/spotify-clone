import React, { useEffect, useMemo, useState } from "react";
import styles from "./QuickSaveModal.module.css";

function QuickSaveModal({
    playlists = [],
    defaultPlaylistId = "",
    onClose,
    onSaveToPlaylist,
    onCreatePlaylist
}) {
    const [selectedId, setSelectedId] = useState(defaultPlaylistId);
    const [isCreating, setIsCreating] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [hasSaved, setHasSaved] = useState(false);

    const orderedPlaylists = useMemo(() => {
        const favorites = playlists.filter((item) => item.isFavorites);
        const regular = playlists.filter((item) => !item.isFavorites);
        return [...favorites, ...regular];
    }, [playlists]);

    useEffect(() => {
        setSelectedId(defaultPlaylistId || orderedPlaylists[0]?.id || "");
    }, [defaultPlaylistId, orderedPlaylists]);

    const saveToPlaylist = async (playlistId) => {
        if (!playlistId) return;
        setHasSaved(true);
        await onSaveToPlaylist?.(playlistId);
        onClose?.();
    };

    const handleOverlayClose = async () => {
        if (!hasSaved && defaultPlaylistId) {
            await saveToPlaylist(defaultPlaylistId);
            return;
        }

        onClose?.();
    };

    const handleCreate = async () => {
        if (!newTitle.trim()) return;
        setHasSaved(true);
        await onCreatePlaylist?.(newTitle.trim());
        onClose?.();
    };

    return (
        <div className={styles.overlay} onClick={handleOverlayClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <div>
                        <h3 className={styles.title}>Сохранить трек</h3>
                        <p className={styles.subtitle}>
                            По умолчанию трек сохранится в любимые, если просто закрыть окно.
                        </p>
                    </div>

                    <button type="button" className={styles.closeButton} onClick={handleOverlayClose}>
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
                                {playlist.isFavorites ? "Сохранить сюда по умолчанию" : (playlist.description || "Пользовательский плейлист")}
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
                            <button type="button" className={`button ${styles.saveButton}`} onClick={handleCreate}>
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

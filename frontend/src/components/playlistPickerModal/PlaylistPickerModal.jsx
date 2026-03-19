import React, { useEffect, useMemo, useState } from "react";
import styles from "./PlaylistPickerModal.module.css";

function PlaylistPickerModal({
    title = "Сохранить в плейлист",
    subtitle = "Выберите плейлист или создайте новый",
    playlists = [],
    onClose,
    onSaveToExisting,
    onCreateAndSave,
    saveLabel = "Сохранить",
    message = "",
    loading = false
}) {
    // One shared picker keeps playlist saving UX identical in track cards and footer player.
    const availablePlaylists = useMemo(
        () => playlists.filter((playlist) => !playlist.isFavorites),
        [playlists]
    );

    const [selectedPlaylistId, setSelectedPlaylistId] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState("");

    useEffect(() => {
        setSelectedPlaylistId(availablePlaylists[0]?.id || "");
    }, [availablePlaylists]);

    const handleSave = () => {
        if (isCreating) {
            onCreateAndSave?.(newPlaylistName);
            return;
        }

        onSaveToExisting?.(selectedPlaylistId);
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <div>
                        <h3 className={styles.title}>{title}</h3>
                        <p className={styles.subtitle}>{subtitle}</p>
                    </div>

                    <button className={styles.closeButton} onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <span className={styles.panelTitle}>Плейлисты</span>
                        <button
                            type="button"
                            className={styles.addButton}
                            onClick={() => setIsCreating((prev) => !prev)}
                            title="Создать новый плейлист"
                        >
                            +
                        </button>
                    </div>

                    {isCreating && (
                        <div className={styles.createBox}>
                            <input
                                type="text"
                                value={newPlaylistName}
                                onChange={(e) => setNewPlaylistName(e.target.value)}
                                className={`input ${styles.nameInput}`}
                                placeholder="Название нового плейлиста"
                            />
                        </div>
                    )}

                    {!isCreating && availablePlaylists.length > 0 && (
                        <div className={styles.list}>
                            {availablePlaylists.map((playlist) => (
                                <button
                                    key={playlist.id}
                                    type="button"
                                    className={`${styles.item} ${selectedPlaylistId === playlist.id ? styles.active : ""}`}
                                    onClick={() => setSelectedPlaylistId(playlist.id)}
                                >
                                    <span className={styles.itemTitle}>{playlist.title}</span>
                                    <span className={styles.itemMeta}>
                                        {playlist.description || "Без описания"}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {!isCreating && availablePlaylists.length === 0 && (
                        <div className={styles.emptyState}>
                            Пока нет обычных плейлистов. Нажмите <strong>+</strong>, чтобы создать новый.
                        </div>
                    )}

                    {message && <p className={styles.message}>{message}</p>}
                </div>

                <div className={styles.actions}>
                    <button
                        type="button"
                        className={`button ${styles.actionButton}`}
                        onClick={handleSave}
                        disabled={loading || (!isCreating && !selectedPlaylistId)}
                    >
                        {loading ? "Сохраняем..." : saveLabel}
                    </button>

                    <button
                        type="button"
                        className={`button ${styles.secondaryButton}`}
                        onClick={onClose}
                    >
                        Отмена
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PlaylistPickerModal;

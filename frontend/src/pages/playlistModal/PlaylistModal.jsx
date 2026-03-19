// src/pages/playlistModal/PlaylistModal.jsx

import React, { useEffect, useMemo, useState } from "react";
import styles from "./PlaylistModal.module.css";

function PlaylistModal({
    tracks,
    currentTrack,
    onSelect,
    onClose,
    onSavePlaylist,
    existingPlaylists = [],
    onAddToExisting,
    playlistNameInitial,
    onClearTempPlaylist
}) {
    // Footer queue and saved playlists share one modal so users do not learn two different flows.
    const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
    const [playlistName, setPlaylistName] = useState("");
    const [selectedExistingId, setSelectedExistingId] = useState("");

    const title = playlistNameInitial || "Плейлист";

    const otherTracks = (tracks || []).filter(t => t.id !== currentTrack?.id);
    const availablePlaylists = useMemo(() => existingPlaylists.filter(
        (playlist) =>
            !playlist.isFavorites &&
            (!playlistNameInitial || playlist.title !== playlistNameInitial)
    ), [existingPlaylists, playlistNameInitial]);

    useEffect(() => {
        setSelectedExistingId(availablePlaylists[0]?.id || "");
    }, [availablePlaylists]);

    const handleConfirmSave = () => {
        if (isCreatingPlaylist) {
            if (!playlistName.trim()) return;

            onSavePlaylist(playlistName.trim(), tracks);
            onClose();
            return;
        }

        if (!selectedExistingId) return;
        onAddToExisting?.(selectedExistingId, tracks);
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                
                <div className={styles.header}>
                    <div>
                        <h2>{title}</h2>
                        <p className={styles.headerInfo}>
                            Выберите плейлист для сохранения очереди или создайте новый через плюс.
                        </p>
                    </div>

                    <div className={styles.headerActions}>
                        <button
                            className={`button ${styles.smallButton} ${styles.deleteBtn}`}
                            onClick={() => {
                                onClearTempPlaylist();
                                onClose();
                            }}
                        >
                            Очистить
                        </button>

                        <button className={styles.closeBtn} onClick={onClose}>×</button>
                    </div>
                </div>

                <div className={styles.savePanel}>
                    <div className={styles.saveHeader}>
                        <span className={styles.sectionLabel}>Сохранение в плейлист</span>
                        <button
                            type="button"
                            className={styles.plusButton}
                            onClick={() => setIsCreatingPlaylist((prev) => !prev)}
                            title="Создать новый плейлист"
                        >
                            +
                        </button>
                    </div>

                    {isCreatingPlaylist && (
                        <div className={styles.nameModal}>
                            <input
                                type="text"
                                className={`input ${styles.nameInput}`}
                                value={playlistName}
                                onChange={(e) => setPlaylistName(e.target.value)}
                                placeholder="Название нового плейлиста"
                            />
                        </div>
                    )}

                    {!isCreatingPlaylist && availablePlaylists.length > 0 && (
                        <div className={styles.existingList}>
                            {availablePlaylists.map((playlist) => (
                                <button
                                    key={playlist.id}
                                    type="button"
                                    className={`${styles.playlistItem} ${selectedExistingId === playlist.id ? styles.playlistItemActive : ""}`}
                                    onClick={() => setSelectedExistingId(playlist.id)}
                                >
                                    <span className={styles.playlistItemTitle}>{playlist.title}</span>
                                    <span className={styles.playlistItemMeta}>
                                        {playlist.description || "Без описания"}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {!isCreatingPlaylist && availablePlaylists.length === 0 && (
                        <div className={styles.emptyPlaylists}>
                            У вас пока нет обычных плейлистов. Нажмите плюс и создайте первый.
                        </div>
                    )}

                    <div className={styles.nameButtons}>
                        <button
                            className={`button ${styles.smallButton}`}
                            onClick={handleConfirmSave}
                            disabled={!isCreatingPlaylist && !selectedExistingId}
                        >
                            Сохранить
                        </button>

                        {isCreatingPlaylist && (
                            <button
                                className={`button ${styles.smallButton}`}
                                onClick={() => setIsCreatingPlaylist(false)}
                            >
                                Назад
                            </button>
                        )}
                    </div>
                </div>

                {currentTrack && (
                    <div className={styles.nowPlayingBlock}>
                        <div className={styles.nowPlayingLabel}>Сейчас играет</div>

                        <div
                            className={`${styles.item} ${styles.active}`}
                            onClick={() => onSelect(currentTrack, true)}
                        >
                            <div className={styles.title}>{currentTrack.title}</div>
                            <div className={styles.artist}>{currentTrack.artist}</div>
                        </div>
                    </div>
                )}

                <div className={styles.list}>
                    {otherTracks.map((track) => (
                        <div
                            key={track.id}
                            className={styles.item}
                            onClick={() => onSelect(track, true)}
                        >
                            <div className={styles.title}>{track.title}</div>
                            <div className={styles.artist}>{track.artist}</div>
                        </div>
                    ))}

                    {otherTracks.length === 0 && !currentTrack && (
                        <div className={styles.noTracks}>Плейлист пуст</div>
                    )}
                </div>

            </div>
        </div>
    );
}

export default PlaylistModal;

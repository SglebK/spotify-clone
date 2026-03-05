// src/pages/playlistModal/PlaylistModal.jsx

import React, { useState } from "react";
import styles from "./PlaylistModal.module.css";

function PlaylistModal({
    tracks,
    currentTrack,
    onSelect,
    onClose,
    onSavePlaylist,
    playlistNameInitial,
    onClearTempPlaylist
}) {

    const [isNaming, setIsNaming] = useState(false);
    const [playlistName, setPlaylistName] = useState("");

    const title = playlistNameInitial || "Плейлист";

    const otherTracks = (tracks || []).filter(t => t.id !== currentTrack?.id);

    const handleSaveClick = () => {
        setIsNaming(true);
    };

    const handleConfirmSave = () => {
        if (!playlistName.trim()) return;

        onSavePlaylist(playlistName, tracks);
        setIsNaming(false);
        onClose();
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                
                <div className={styles.header}>
                    <h2>{title}</h2>

                    {/* ⭐ Новый плейлист → кнопка Сохранить */}
                    {!playlistNameInitial && !isNaming && (
                        <button
                            className={`button ${styles.smallButton}`}
                            onClick={handleSaveClick}
                        >
                            Сохранить
                        </button>
                    )}

                    {/* ⭐ Кнопка Очистить — теперь ВСЕГДА */}
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

                {isNaming && (
                    <div className={styles.nameModal}>
                        <p>Введите название плейлиста</p>

                        <input
                            type="text"
                            className={`input ${styles.nameInput}`}
                            value={playlistName}
                            onChange={(e) => setPlaylistName(e.target.value)}
                            placeholder="Например: Мой плейлист"
                        />

                        <div className={styles.nameButtons}>
                            <button
                                className={`button ${styles.smallButton}`}
                                onClick={handleConfirmSave}
                            >
                                ОК
                            </button>

                            <button
                                className={`button ${styles.smallButton}`}
                                onClick={() => setIsNaming(false)}
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                )}

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

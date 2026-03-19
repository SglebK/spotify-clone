// src/pages/myPlaylists/myPlaylistsRight/MyPlaylistsRight.jsx

import React from "react";
import styles from "./MyPlaylistsRight.module.css";
import { useMyPlaylistsRightLogic } from "./MyPlaylistsRightFunction";
import { fixUrl } from "../../../components/utils/fixUrl/fixUrl";

function MyPlaylistsRight({
    playlist,
    setPlaylists,
    onPlayTrack,
    onPlayPlaylist,
    onSetPlaylistName,
    searchQuery
}) {

    const {
        tracks,
        title,
        description,
        isPublic,
        coverFile,
        message,
        setTitle,
        setDescription,
        setCoverFile,
        savePlaylistDetails,
        deletePlaylist,
        togglePrivacy
    } = useMyPlaylistsRightLogic(playlist, setPlaylists);

    // Если плейлист не выбран — заглушка
    if (!playlist) {
        return (
            <div className={styles.right}>
                <div className={styles.placeholder}>Выберите плейлист слева</div>
            </div>
        );
    }

    return (
        <div className={styles.right}>

            {/* Панель кнопок */}
            <div className={styles.grid321}>

                <button className={`button ${styles.buttonFix}`} onClick={savePlaylistDetails}>
                    Сохранить
                </button>

                <button className={`button ${styles.buttonFix}`} onClick={deletePlaylist}>
                    Удалить
                </button>

                <label className={styles.grid3213}>
                    <span>Публичный</span>
                    <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={togglePrivacy}
                    />
                </label>

                {/* ⭐ Играть весь плейлист */}
                <button
                    className={`button ${styles.buttonFix}`}
                    onClick={() => {
                        const prepared = tracks.map(t => ({
                            ...t,
                            audioUrl: fixUrl(t.audioUrl),
                            coverUrl: fixUrl(t.coverUrl)
                        }));

                        // 👉 В ЭТОТ МОМЕНТ поднимаем НАЗВАНИЕ наверх
                        if (onSetPlaylistName && title) {
                            onSetPlaylistName(title);
                        }

                        // 👉 И только потом передаём треки в Footer / модалку
                        onPlayPlaylist(prepared);
                    }}
                >
                    Прослушать плейлист
                </button>

            </div>

            {/* Название + количество */}
            <div className={styles.grid322}>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`input ${styles.editInput}`}
                    placeholder="Название плейлиста"
                />
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`input ${styles.editTextarea}`}
                    placeholder="Описание плейлиста"
                />
                <label className={styles.fileLabel}>
                    <span>Новая обложка</span>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                    />
                    {coverFile && <span className={styles.fileHint}>{coverFile.name}</span>}
                </label>
                <p className={styles.count}>{tracks.length} треков</p>
                {message && <p className={styles.message}>{message}</p>}
            </div>

            {/* Список треков */}
            <div className={styles.grid323}>
                <h3 className={styles.tracksTitle}>Треки:</h3>

                {tracks.length === 0 && (
                    <p className={styles.noTracks}>В этом плейлисте пока нет треков</p>
                )}

                <ul className={styles.trackList}>
                    {tracks
                        .filter((trackItem) => {
                            const query = searchQuery?.trim().toLowerCase();
                            if (!query) return true;
                            return (
                                trackItem.title?.toLowerCase().includes(query) ||
                                trackItem.artist?.toLowerCase().includes(query)
                            );
                        })
                        .map(t => (
                        <li key={t.id} className={styles.trackItem}>

                            <img
                                src={fixUrl(t.coverUrl)}
                                alt={t.title}
                                className={styles.cover}
                            />

                            <div className={styles.trackInfo}>
                                <div className={styles.trackTitle}>{t.title}</div>
                                <div className={styles.trackArtist}>{t.artist}</div>
                            </div>

                            {/* ⭐ Играть один трек */}
                            <button
                                className={`button ${styles.buttonFix} ${styles.playBtn}`}
                                onClick={() =>
                                    onPlayTrack({
                                        ...t,
                                        audioUrl: fixUrl(t.audioUrl),
                                        coverUrl: fixUrl(t.coverUrl)
                                    })
                                }
                            >
                                Играть
                            </button>

                        </li>
                    ))}
                </ul>
            </div>

        </div>
    );
}

export default MyPlaylistsRight;

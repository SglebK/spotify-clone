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
    onSetPlaylistName
}) {

    const {
        tracks,
        title,
        isPublic,
        renamePlaylist,
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

                <button className={`button ${styles.buttonFix}`} onClick={renamePlaylist}>
                    Переименовать
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
                <h2 className={styles.plTitle}>{title}</h2>
                <p className={styles.count}>{tracks.length} треков</p>
            </div>

            {/* Список треков */}
            <div className={styles.grid323}>
                <h3 className={styles.tracksTitle}>Треки:</h3>

                {tracks.length === 0 && (
                    <p className={styles.noTracks}>В этом плейлисте пока нет треков</p>
                )}

                <ul className={styles.trackList}>
                    {tracks.map(t => (
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

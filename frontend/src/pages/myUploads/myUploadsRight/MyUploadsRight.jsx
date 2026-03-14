// src/pages/myUploads/myUploadsRight/MyUploadsRight.jsx

import React from "react";
import styles from "./MyUploadsRight.module.css";
import { fixUrl } from "../../../components/utils/fixUrl/fixUrl";
import { useMyUploadsRightLogic } from "./MyUploadsRightFunction";

function MyUploadsRight({ track, onPlayTrack, setTracks, setMyTracks, setSelectedTrack }) {
    // always call hook to satisfy rules of hooks
    const {
        isPublic,
        playlistMessage,
        editTrack,
        deleteTrack,
        togglePublic,
        addToPlaylist
    } = useMyUploadsRightLogic(track, onPlayTrack, setTracks, setMyTracks, setSelectedTrack);

    if (!track) {
        return (
            <div className={styles.right}>
                <div className={styles.placeholder}>Выберите трек слева</div>
            </div>
        );
    }

    return (
        <div className={styles.right}>

            <div className={styles.grid321}>

                <button className={`button ${styles.buttonFix}`} onClick={editTrack}>
                    Изменить
                </button>

                <button className={`button ${styles.buttonFix}`} onClick={deleteTrack}>
                    Удалить
                </button>

                <label className={`${styles.grid3213} ${styles.buttonFix}`}>
                    <span>Публичный</span>
                    <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={togglePublic}
                    />
                </label>

                {/* ⭐ Добавить в плейлист — добавляет в tracks */}
                <button
                    className={`button ${styles.buttonFix}`}
                    onClick={addToPlaylist}
                >
                    В любимые
                </button>

                {/* ⭐ Прослушать — заменяет текущий трек */}
                <button
                    className={`button ${styles.buttonFix}`}
                    onClick={() =>
                        onPlayTrack({
                            ...track,
                            audioUrl: fixUrl(track.audioUrl),
                            coverUrl: fixUrl(track.coverUrl)
                        })
                    }
                >
                    Прослушать
                </button>

            </div>

            <div className={styles.grid322}>
                <h2 className={styles.title}>{track.title}</h2>
                <p className={styles.artist}>{track.artist}</p>
                {playlistMessage && (
                    <p className={styles.statusMessage}>{playlistMessage}</p>
                )}
            </div>

            <div className={styles.grid323}>
                <img
                    src={fixUrl(track.coverUrl)}
                    alt={track.title}
                    className={styles.cover}
                />
            </div>

        </div>
    );
}

export default MyUploadsRight;

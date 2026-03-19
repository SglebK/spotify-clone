// src/pages/myUploads/myUploadsRight/MyUploadsRight.jsx

import React from "react";
import styles from "./MyUploadsRight.module.css";
import { fixUrl } from "../../../components/utils/fixUrl/fixUrl";
import { useMyUploadsRightLogic } from "./MyUploadsRightFunction";
import PlaylistPickerModal from "../../../components/playlistPickerModal/PlaylistPickerModal";

function MyUploadsRight({ track, onPlayTrack, setTracks, setMyTracks, setSelectedTrack }) {
    // always call hook to satisfy rules of hooks
    const {
        isPublic,
        playlistMessage,
        title,
        artist,
        playlists,
        isPlaylistPickerOpen,
        playlistSaving,
        setTitle,
        setArtist,
        setCoverFile,
        setIsPlaylistPickerOpen,
        editTrack,
        deleteTrack,
        togglePublic,
        addToPlaylist,
        createPlaylistAndAdd,
        addToQueue,
        addToFavorites
    } = useMyUploadsRightLogic(track, onPlayTrack, setTracks, setMyTracks, setSelectedTrack);

    if (!track) {
        return (
            <div className={styles.right}>
                <div className={styles.placeholder}>Выберите трек слева</div>
            </div>
        );
    }

    return (
        <>
        <div className={styles.right}>

            <div className={styles.grid321}>

                <button className={`button ${styles.buttonFix}`} onClick={editTrack}>
                    Сохранить
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
                    onClick={addToQueue}
                >
                    В очередь
                </button>

                <button
                    className={`button ${styles.buttonFix}`}
                    onClick={() => setIsPlaylistPickerOpen(true)}
                >
                    В плейлист
                </button>

                <button
                    className={`button ${styles.buttonFix}`}
                    onClick={addToFavorites}
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
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`input ${styles.editInput}`}
                    placeholder="Название трека"
                />
                <input
                    type="text"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    className={`input ${styles.editInput}`}
                    placeholder="Исполнитель"
                />
                <label className={styles.fileLabel}>
                    <span>Новая обложка</span>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                    />
                </label>
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

        {isPlaylistPickerOpen && (
            <PlaylistPickerModal
                title="Добавить трек в плейлист"
                subtitle="Выберите готовый плейлист или нажмите плюс, чтобы быстро создать новый."
                playlists={playlists}
                onClose={() => setIsPlaylistPickerOpen(false)}
                onSaveToExisting={addToPlaylist}
                onCreateAndSave={createPlaylistAndAdd}
                saveLabel="Сохранить"
                message={playlistMessage}
                loading={playlistSaving}
            />
        )}
        </>
    );
}

export default MyUploadsRight;

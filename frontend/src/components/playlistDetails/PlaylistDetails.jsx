import React, { useState } from "react";
import styles from "./PlaylistDetails.module.css";
import { fixUrl } from "@helpers/fixUrl";
import { PlaylistCardTrack } from "@components";
import PlaylistEditModal from "@components/playlistEditModal/PlaylistEditModal.jsx";
import TrackModal from "@components/trackModal/TrackModal.jsx";
import QuickSaveModal from "@components/quickSaveModal/QuickSaveModal.jsx";
import { useAuth } from "@context/AuthContext.jsx";

function PlaylistDetails({
    selected,
    user,
    deletePlaylist,
    setTracks,
    setPlaylistName,
    setCurrentTrack,
    onPlayTrack
}) {
    const { loading } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [selectedTrack, setSelectedTrack] = useState(null);
    const [quickSaveTrack, setQuickSaveTrack] = useState(null);
    const [showQuickSave, setShowQuickSave] = useState(false);

    if (loading) return null;

    if (!selected) {
        return <div className={styles.empty}>Выберите плейлист</div>;
    }
    const isOwner = !!user && selected.userId === user.id;
    const canManagePlaylist = !!user && (isOwner || user.isAdmin);
    const isPublic = !!selected.isPublic;
    const handlePlayAll = () => {
        const prepared = (selected.tracks || []).map((track) => ({
            ...track,
            audioUrl: fixUrl(track.audioUrl),
            coverUrl: fixUrl(track.coverUrl)
        }));
        setTracks(prepared);
        setPlaylistName(selected.title);
        if (prepared.length > 0) {
            setCurrentTrack(prepared[0]);
        }
    };
    return (
        <div className={styles.wrapper}>
            <div className={styles.hero}>
                <div className={styles.coverCell}>
                    <img
                        src={fixUrl(selected.coverUrl) || "/default-cover.png"}
                        alt={selected.title}
                        className={styles.cover}
                    />
                </div>
                <div className={styles.info}>
                    <h2 className={styles.title}>{selected.title}</h2>
                    <p className={styles.description}>
                        {selected.description || "Описание пока не добавлено"}
                    </p>
                    {isPublic && !isOwner && selected.ownerEmail && (
                        <p className={styles.meta}>{selected.ownerEmail}</p>
                    )}
                    <div className={styles.buttonCell}>
                        <button className={styles.playButton} onClick={handlePlayAll}>
                            Слушать плейлист
                        </button>
                    </div>
                    {isOwner && (
                        <div className={styles.buttonCell}>
                            <button
                                className={styles.editButton}
                                onClick={() => setIsEditing(true)}
                            >
                                Редактировать
                            </button>
                        </div>
                    )}
                    {canManagePlaylist && !selected.isFavorites && (
                        <div className={styles.buttonCell}>
                            <button
                                className={styles.kickButton}
                                onClick={() => deletePlaylist(selected.id)}
                            >
                                {isOwner ? "Удалить плейлист" : "Удалить как админ"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div className={styles.trackList}>
                {(selected.tracks || []).map((track) => (
                    <PlaylistCardTrack
                        key={track.id}
                        track={track}
                        onOpen={() => setSelectedTrack(track)}
                        onPlay={(t) =>
                            onPlayTrack({
                                ...t,
                                audioUrl: fixUrl(t.audioUrl),
                                coverUrl: fixUrl(t.coverUrl)
                            })
                        }
                    />
                ))}
            </div>
            {selectedTrack && (
                <div className="overlay" onClick={() => setSelectedTrack(null)}>
                    <TrackModal
                        track={selectedTrack}
                        onClose={() => setSelectedTrack(null)}
                        onPlay={(t) => onPlayTrack(t)}
                        onAdd={(t) => setTracks((prev) => [...prev, t])}
                        isAdmin={user?.isAdmin}
                        user={user}
                        onAddToPlaylist={(track) => {
                            setQuickSaveTrack(track);
                            setShowQuickSave(true);
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
            {isEditing && (
                <PlaylistEditModal
                    playlist={selected}
                    onClose={() => setIsEditing(false)}
                    deletePlaylist={deletePlaylist}
                />
            )}
        </div>
    );
}
export default PlaylistDetails;

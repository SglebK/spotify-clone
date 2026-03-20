import React, { useEffect, useState } from "react";
import styles from "./AllPlaylists.module.css";
import { API_URL } from "../../components/utils/api/config";
import { fixUrl } from "../../components/utils/fixUrl/fixUrl";
import { useAuth } from "../../context/auth/AuthContext.jsx";
import { authFetch } from "../../components/utils/api/authFetch.js";
import { useError } from "../../context/error/ErrorContext.jsx";

function AllPlaylists({ onPlayTrack, setTracks, setCurrentTrack, setPlaylistName, searchQuery }) {
    const [playlists, setPlaylists] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { showError } = useError();

    useEffect(() => {
        let active = true;

        const load = async () => {
            try {
                const res = await fetch(`${API_URL}/api/playlists/public`);
                const data = await res.json();
                if (!active) return;
                setPlaylists(data);
                setSelectedId((prev) => prev || data[0]?.id || null);
            } catch (err) {
                console.error("Ошибка загрузки публичных плейлистов:", err);
                showError("Не удалось загрузить публичные плейлисты");
            } finally {
                if (active) setLoading(false);
            }
        };

        load();
        const intervalId = setInterval(load, 12000);

        return () => {
            active = false;
            clearInterval(intervalId);
        };
    }, [showError]);

    const filteredPlaylists = playlists.filter((playlist) => {
        const query = searchQuery?.trim().toLowerCase();
        if (!query) return true;

        return (
            playlist.title?.toLowerCase().includes(query) ||
            playlist.description?.toLowerCase().includes(query) ||
            playlist.ownerEmail?.toLowerCase().includes(query)
        );
    });

    const selected = filteredPlaylists.find((playlist) => playlist.id === selectedId) || filteredPlaylists[0] || null;

    const deletePlaylist = async (playlistId) => {
        if (!user?.isAdmin) return;
        if (!confirm("Удалить этот плейлист?")) return;

        try {
            const res = await authFetch(`${API_URL}/api/playlists/${playlistId}`, {
                method: "DELETE"
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Не удалось удалить плейлист");
            }

            setPlaylists((prev) => prev.filter((item) => item.id !== playlistId));
            setSelectedId((prev) => (prev === playlistId ? null : prev));
        } catch (error) {
            showError(error.message || "Не удалось удалить плейлист");
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.sidebar}>
                <h2 className={styles.title}>Все плейлисты</h2>

                {loading && <p className={styles.info}>Загрузка...</p>}

                {!loading && filteredPlaylists.length === 0 && (
                    <p className={styles.info}>Пока нет публичных плейлистов</p>
                )}

                <div className={styles.list}>
                    {filteredPlaylists.map((playlist) => (
                        <button
                            key={playlist.id}
                            type="button"
                            className={`${styles.item} ${selected?.id === playlist.id ? styles.active : ""}`}
                            onClick={() => setSelectedId(playlist.id)}
                        >
                            <span className={styles.itemTitle}>{playlist.title}</span>
                            <span className={styles.itemMeta}>
                                {playlist.trackCount} треков
                                {playlist.ownerEmail ? ` • ${playlist.ownerEmail}` : ""}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.content}>
                {!selected && !loading && (
                    <div className={styles.emptyState}>Выберите плейлист слева</div>
                )}

                {selected && (
                    <>
                        <div className={styles.hero}>
                            <img
                                src={fixUrl(selected.coverUrl) || "/default-cover.png"}
                                alt={selected.title}
                                className={styles.heroCover}
                            />
                            <div className={styles.heroInfo}>
                                <p className={styles.kicker}>Публичный плейлист</p>
                                <h2 className={styles.heroTitle}>{selected.title}</h2>
                                <p className={styles.heroDescription}>
                                    {selected.description || "Описание пока не добавлено"}
                                </p>
                                <p className={styles.heroMeta}>
                                    {selected.ownerEmail || "Пользователь"}
                                </p>
                                <button
                                    className={`button ${styles.playButton}`}
                                    onClick={() => {
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
                                    }}
                                >
                                    Слушать плейлист
                                </button>
                                {user?.isAdmin && (
                                    <button
                                        className={`button ${styles.playButton} ${styles.deleteButton}`}
                                        onClick={() => deletePlaylist(selected.id)}
                                    >
                                        Удалить плейлист
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className={styles.trackList}>
                            {(selected.tracks || []).map((track) => (
                                <div key={track.id} className={styles.trackRow}>
                                    <img
                                        src={fixUrl(track.coverUrl) || "/default-cover.png"}
                                        alt={track.title}
                                        className={styles.trackCover}
                                    />
                                    <div className={styles.trackText}>
                                        <div className={styles.trackTitle}>{track.title}</div>
                                        <div className={styles.trackArtist}>{track.artist}</div>
                                    </div>
                                    <button
                                        className={`button ${styles.trackButton}`}
                                        onClick={() =>
                                            onPlayTrack({
                                                ...track,
                                                audioUrl: fixUrl(track.audioUrl),
                                                coverUrl: fixUrl(track.coverUrl)
                                            })
                                        }
                                    >
                                        Играть
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default AllPlaylists;

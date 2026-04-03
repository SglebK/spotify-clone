import React, { useEffect, useState, useCallback } from "react";
import styles from "./MyPlaylists.module.css";
import api from "@api/axios";
import { useAuth } from "@context/AuthContext";
import { useError } from "@context/ErrorContext.jsx";
import { fixUrl } from "@helpers/fixUrl";
import { PlaylistCard, PlaylistDetails } from "@components";
import { subscribeLibraryChanged } from "@helpers/libraryEvents";
function MyPlaylists({
    setTracks,
    setCurrentTrack,
    setPlaylistName,
    searchQuery
}) {
    const { user, accessToken } = useAuth();
    const { showError } = useError();
    const [playlists, setPlaylists] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [selectedFull, setSelectedFull] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [isNarrow, setIsNarrow] = useState(window.innerWidth <= 1000);
    useEffect(() => {
        const onResize = () => setIsNarrow(window.innerWidth <= 1000);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);
    const loadFavorites = async () => {
        try {
            const { data } = await api.get("/api/playlists/favorites");
            return {
                ...data,
                coverUrl: fixUrl(data.coverUrl)
            };
        } catch (err) {
            console.error("Ошибка загрузки любимых:", err);
            return null;
        }
    };
    const refreshPlaylists = useCallback(() => {
        if (!user || !accessToken) return;
        setLoading(true);
        Promise.all([
            api.get("/api/playlists/my").then(r => r.data),
            loadFavorites()
        ])
            .then(([mine, favorites]) => {
                const preparedMine = mine.map(p => ({
                    ...p,
                    coverUrl: fixUrl(p.coverUrl)
                }));
                const alreadyHasFavorites = preparedMine.some(p => p.isFavorites);
                let withSystem;
                if (alreadyHasFavorites) {
                    withSystem = preparedMine;
                } else {
                    withSystem = favorites ? [favorites, ...preparedMine] : preparedMine;
                }
                setPlaylists(withSystem);
                setSelectedId(prev => {
                    if (prev && withSystem.some(p => p.id === prev)) return prev;
                    const fav = withSystem.find(p => p.isFavorites);
                    return fav?.id || null;
                });
            })
            .catch(err => {
                console.error("Ошибка загрузки плейлистов пользователя:", err);
                showError("Не удалось загрузить ваши плейлисты");
            })
            .finally(() => setLoading(false));
    }, [user, accessToken, showError]);
    useEffect(() => {
        refreshPlaylists();
        const intervalId = setInterval(refreshPlaylists, 12000);
        const unsubscribe = subscribeLibraryChanged(({ kind }) => {
            if (kind === "playlist-updated" || kind === "favorites") {
                refreshPlaylists();
                if (selectedId) {
                    api.get(`/api/playlists/${selectedId}`)
                        .then(res => setSelectedFull({
                            ...res.data,
                            coverUrl: fixUrl(res.data.coverUrl)
                        }));
                }
            }
        });
        return () => {
            clearInterval(intervalId);
            unsubscribe();
        };
    }, [refreshPlaylists, selectedId]);
    useEffect(() => {
        if (!selectedId) {
            setSelectedFull(null);
            return;
        }
        setLoadingDetails(true);
        api.get(`/api/playlists/${selectedId}`)
            .then(res => {
                setSelectedFull({
                    ...res.data,
                    coverUrl: fixUrl(res.data.coverUrl),
                    tracks: (res.data.tracks || []).map(t => ({
                        ...t,
                        audioUrl: fixUrl(t.audioUrl),
                        coverUrl: fixUrl(t.coverUrl)
                    }))
                });
            })
            .catch(err => {
                console.error("Ошибка загрузки плейлиста:", err);
                showError("Не удалось загрузить плейлист");
            })
            .finally(() => setLoadingDetails(false));
    }, [selectedId, showError]);
    const filtered = playlists.filter((playlist) => {
        const q = searchQuery?.trim().toLowerCase();
        if (!q) return true;
        return (
            playlist.title?.toLowerCase().includes(q) ||
            playlist.description?.toLowerCase().includes(q)
        );
    });
    const deletePlaylist = async (playlistId) => {
        if (!user) return;
        if (!confirm("Удалить этот плейлист?")) return;
        try {
            await api.delete(`/api/playlists/${playlistId}`);
            setPlaylists(prev => prev.filter(item => item.id !== playlistId));
            setSelectedId(prev => (prev === playlistId ? null : prev));
        } catch (error) {
            console.error("Ошибка удаления плейлиста:", error);
            showError(error.response?.data?.error || "Не удалось удалить плейлист");
        }
    };
    const rootClassName = `${styles.page} ${
        isNarrow && selectedId ? styles.hasSelected : ""
    }`;
    return (
        <div className={rootClassName}>
            {isNarrow && !selectedId && (
                <div className={styles.sidebar}>
                    <div className={styles.headerRow}>
                        <h2 className={styles.title}>Мои плейлисты</h2>
                        <button
                            type="button"
                            className={styles.createButton}
                            onClick={async () => {
                                const name = prompt("Название нового плейлиста:");
                                if (name?.trim()) {
                                    try {
                                        const { data } = await api.post("/api/playlists", {
                                            title: name.trim()
                                        });
                                        setPlaylists(prev => [data, ...prev]);
                                        setSelectedId(data.id);
                                    } catch (err) {
                                        showError("Не удалось создать плейлист");
                                    }
                                }
                            }}
                        >
                            + Новый
                        </button>
                    </div>
                    {loading && <p className={styles.info}>Загрузка...</p>}
                    {!loading && filtered.length === 0 && (
                        <p className={styles.info}>У вас пока нет плейлистов</p>
                    )}
                    <div className={styles.list}>
                        {filtered.map((playlist) => (
                            <PlaylistCard
                                key={playlist.id}
                                playlist={playlist}
                                active={selectedId === playlist.id}
                                onClick={() => setSelectedId(playlist.id)}
                            />
                        ))}
                    </div>
                </div>
            )}
            {isNarrow && selectedId && (
                <div className={styles.content}>
                    <button
                        className={styles.backBtn}
                        onClick={() => setSelectedId(null)}
                    >
                        ← Назад
                    </button>
                    {loadingDetails ? (
                        <p className={styles.info}>Загрузка плейлиста...</p>
                    ) : (
                        <PlaylistDetails
                            selected={selectedFull}
                            user={user}
                            deletePlaylist={deletePlaylist}
                            setTracks={setTracks}
                            setPlaylistName={setPlaylistName}
                            setCurrentTrack={setCurrentTrack}
                            onPlayTrack={setCurrentTrack}
                        />
                    )}
                </div>
            )}
            {!isNarrow && (
                <>
                    <div className={styles.sidebar}>
                        <div className={styles.headerRow}>
                            <h2 className={styles.title}>Мои плейлисты</h2>
                            <button
                                type="button"
                                className={styles.createButton}
                                onClick={async () => {
                                    const name = prompt("Название нового плейлиста:");
                                    if (name?.trim()) {
                                        try {
                                            const { data } = await api.post("/api/playlists", {
                                                title: name.trim()
                                            });
                                            setPlaylists(prev => [data, ...prev]);
                                            setSelectedId(data.id);
                                        } catch (err) {
                                            showError("Не удалось создать плейлист");
                                        }
                                    }
                                }}
                            >
                                + Новый
                            </button>
                        </div>
                        {loading && <p className={styles.info}>Загрузка...</p>}
                        {!loading && filtered.length === 0 && (
                            <p className={styles.info}>У вас пока нет плейлистов</p>
                        )}
                        <div className={styles.list}>
                            {filtered.map((playlist) => (
                                <PlaylistCard
                                    key={playlist.id}
                                    playlist={playlist}
                                    active={selectedId === playlist.id}
                                    onClick={() => setSelectedId(playlist.id)}
                                />
                            ))}
                        </div>
                    </div>
                    <div className={styles.content}>
                        {loadingDetails ? (
                            <p className={styles.info}>Загрузка плейлиста...</p>
                        ) : (
                            <PlaylistDetails
                                selected={selectedFull}
                                user={user}
                                deletePlaylist={deletePlaylist}
                                setTracks={setTracks}
                                setPlaylistName={setPlaylistName}
                                setCurrentTrack={setCurrentTrack}
                                onPlayTrack={setCurrentTrack}
                            />
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
export default MyPlaylists;

import React, { useEffect, useState } from "react";
import styles from "./AllPlaylists.module.css";
import api from "@api/axios";
import { useAuth } from "@context/AuthContext.jsx";
import { useError } from "@context/ErrorContext.jsx";
import { PlaylistCard, PlaylistDetails } from "@components";
import { subscribeLibraryChanged } from "@helpers/libraryEvents";
import { fixUrl } from "@helpers/fixUrl";
function AllPlaylists({
    onPlayTrack,
    setTracks,
    setCurrentTrack,
    setPlaylistName,
    searchQuery
}) {
    const [playlists, setPlaylists] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isNarrow, setIsNarrow] = useState(window.innerWidth <= 1000);
    const { user } = useAuth();
    const { showError } = useError();
    useEffect(() => {
        const onResize = () => setIsNarrow(window.innerWidth <= 1000);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);
    const loadPublicPlaylists = async () => {
        try {
            const { data } = await api.get("/api/playlists/public");
            const prepared = data.map(p => ({
                ...p,
                coverUrl: fixUrl(p.coverUrl)
            }));
            setPlaylists(prepared);
            if (selectedId && !prepared.find(p => p.id === selectedId)) {
                setSelectedId(null);
            }
        } catch (err) {
            console.error("Ошибка загрузки публичных плейлистов:", err);
            showError("Не удалось загрузить публичные плейлисты");
        }
    };
    useEffect(() => {
        let active = true;
        const load = async () => {
            if (!active) return;
            await loadPublicPlaylists();
            setLoading(false);
        };
        load();
        const intervalId = setInterval(load, 12000);
        return () => {
            active = false;
            clearInterval(intervalId);
        };
    }, [showError]);
    useEffect(() => {
        const unsubscribe = subscribeLibraryChanged(({ kind }) => {
            if (kind === "playlist-updated") {
                loadPublicPlaylists();
            }
        });
        return unsubscribe;
    }, [selectedId]);
    const filtered = playlists.filter((playlist) => {
        const q = searchQuery?.trim().toLowerCase();
        if (!q) return true;
        return (
            playlist.title?.toLowerCase().includes(q) ||
            playlist.description?.toLowerCase().includes(q) ||
            playlist.ownerEmail?.toLowerCase().includes(q)
        );
    });
    const selected =
        filtered.find((p) => p.id === selectedId) || null;
    const deletePlaylist = async (playlistId) => {
        const playlist = playlists.find(p => p.id === playlistId);
        const canDelete = !!playlist && (playlist.userId === user?.id || user?.isAdmin);
        if (!canDelete) return;
        if (!confirm(user?.isAdmin && playlist.userId !== user?.id ? "Удалить этот плейлист как админ?" : "Удалить этот плейлист?")) return;
        try {
            await api.delete(`/api/playlists/${playlistId}`);
            setPlaylists(prev => prev.filter(item => item.id !== playlistId));
            setSelectedId(prev => (prev === playlistId ? null : prev));
        } catch (error) {
            showError(error.response?.data?.error || "Не удалось удалить плейлист");
        }
    };
    const rootClassName = `${styles.page} ${
        isNarrow && selected ? styles.hasSelected : ""
    }`;
    return (
        <div className={rootClassName}>
            {isNarrow && !selected && (
                <div className={styles.sidebar}>
                    <h2 className={styles.title}>Все плейлисты</h2>
                    {loading && <p className={styles.info}>Загрузка...</p>}
                    {!loading && filtered.length === 0 && (
                        <p className={styles.info}>Пока нет публичных плейлистов</p>
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
            {isNarrow && selected && (
                <div className={styles.content}>
                    <button className={styles.backBtn} onClick={() => setSelectedId(null)}>
                        ← Назад
                    </button>
                    <PlaylistDetails
                        selected={selected}
                        user={user}
                        deletePlaylist={deletePlaylist}
                        setTracks={setTracks}
                        setPlaylistName={setPlaylistName}
                        setCurrentTrack={setCurrentTrack}
                        onPlayTrack={onPlayTrack}
                    />
                </div>
            )}
            {!isNarrow && (
                <>
                    <div className={styles.sidebar}>
                        <h2 className={styles.title}>Все плейлисты</h2>
                        {loading && <p className={styles.info}>Загрузка...</p>}
                        {!loading && filtered.length === 0 && (
                            <p className={styles.info}>Пока нет публичных плейлистов</p>
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
                        <PlaylistDetails
                            selected={selected}
                            user={user}
                            deletePlaylist={deletePlaylist}
                            setTracks={setTracks}
                            setPlaylistName={setPlaylistName}
                            setCurrentTrack={setCurrentTrack}
                            onPlayTrack={onPlayTrack}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
export default AllPlaylists;

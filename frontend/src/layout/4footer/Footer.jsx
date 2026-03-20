// src/layout/4footer/Footer.jsx

import React, { useEffect, useState } from 'react';
import styles from './Footer.module.css';

import Footer41 from './footer41/Footer41';
import Footer42 from './footer42/Footer42';
import Footer43 from './footer43/Footer43';
import QuickSaveModal from '../../components/quickSaveModal/QuickSaveModal.jsx';

import { useAuth } from '../../context/auth/AuthContext';
import { API_URL } from '../../components/utils/api/config';
import Toast from '../../components/toast/Toast';
import { authFetch } from '../../components/utils/api/authFetch.js';
import { useError } from '../../context/error/ErrorContext.jsx';
import { emitLibraryChanged } from '../../components/utils/libraryEvents.js';

function Footer({ 
    theme, 
    track, 
    setTrack, 
    tracks
}) {

    const { user, accessToken } = useAuth();
    const { showError } = useError();

    const [volume, setVolume] = useState(0.1);
    const [favoriteTrackIds, setFavoriteTrackIds] = useState([]);
    const [userPlaylists, setUserPlaylists] = useState([]);
    const [isQuickSaveOpen, setIsQuickSaveOpen] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 2200);
    };

    useEffect(() => {
        if (!user || !accessToken) {
            setFavoriteTrackIds([]);
            setUserPlaylists([]);
            return;
        }

        let active = true;

        const loadLibrary = async () => {
            try {
                const [favoritesRes, playlistsRes] = await Promise.all([
                    authFetch(`${API_URL}/api/playlists/favorites`),
                    authFetch(`${API_URL}/api/playlists/my`)
                ]);

                const favoritesData = await favoritesRes.json();
                const playlistsData = await playlistsRes.json();

                if (!favoritesRes.ok) {
                    throw new Error(favoritesData.error || "Не удалось загрузить любимые");
                }

                if (!playlistsRes.ok) {
                    throw new Error(playlistsData.error || "Не удалось загрузить плейлисты");
                }

                if (!active) return;

                setFavoriteTrackIds((favoritesData.tracks || []).map((item) => item.id));
                setUserPlaylists(playlistsData);
            } catch (error) {
                console.error("Ошибка загрузки библиотеки футера:", error);
            }
        };

        const handleLibraryChanged = () => loadLibrary();

        loadLibrary();
        const intervalId = setInterval(loadLibrary, 12000);
        window.addEventListener("library:changed", handleLibraryChanged);

        return () => {
            active = false;
            clearInterval(intervalId);
            window.removeEventListener("library:changed", handleLibraryChanged);
        };
    }, [user, accessToken]);

    const hasNextTrack = () => {
        if (!tracks || tracks.length === 0) return false;
        const currentIndex = tracks.findIndex(t => t.id === track?.id);
        return currentIndex !== -1 && currentIndex < tracks.length - 1;
    };

    const hasPreviousTrack = () => {
        if (!tracks || tracks.length === 0) return false;
        const currentIndex = tracks.findIndex(t => t.id === track?.id);
        return currentIndex > 0;
    };

    const playPreviousTrack = () => {
        if (!tracks || tracks.length === 0) return;

        const currentIndex = tracks.findIndex((item) => item.id === track?.id);

        if (currentIndex > 0) {
            setTrack(tracks[currentIndex - 1]);
            return;
        }

        setTrack(tracks[0]);
    };

    const playNextTrack = () => {
        if (!tracks || tracks.length === 0) return;

        const currentIndex = tracks.findIndex(t => t.id === track?.id);

        if (currentIndex === -1) {
            setTrack(tracks[0]);
            return;
        }

        const nextIndex = currentIndex + 1;

        if (nextIndex < tracks.length) {
            setTrack(tracks[nextIndex]);
            return;
        }

        setTrack(tracks[0]);
    };

    const saveTrackToPlaylist = async (playlistId) => {
        if (!track?.id || !playlistId) return;

        const favoritesPlaylist = userPlaylists.find((item) => item.isFavorites);
        const isFavoritesTarget = playlistId === favoritesPlaylist?.id;

        try {
            if (isFavoritesTarget) {
                const res = await authFetch(`${API_URL}/api/playlists/favorites/tracks`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ trackId: track.id })
                });

                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || "Не удалось добавить в любимые");
                }

                setFavoriteTrackIds((prev) => (prev.includes(track.id) ? prev : [...prev, track.id]));
                emitLibraryChanged("favorites");
                showToast(data.added ? "Добавлено в любимые" : "Уже в любимых");
                return;
            }

            const res = await authFetch(`${API_URL}/api/playlist-tracks`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    playlistId,
                    trackId: track.id
                })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Не удалось добавить в плейлист");
            }

            emitLibraryChanged("playlists");
            showToast(data.added ? "Трек добавлен в плейлист" : "Трек уже был в плейлисте");
        } catch (error) {
            showError(error.message || "Не удалось сохранить трек");
        }
    };

    const createPlaylistAndSaveTrack = async (title) => {
        try {
            const createRes = await authFetch(`${API_URL}/api/playlists`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title,
                    description: null
                })
            });

            const created = await createRes.json();
            if (!createRes.ok) {
                throw new Error(created.error || "Не удалось создать плейлист");
            }

            setUserPlaylists((prev) => [created, ...prev]);
            emitLibraryChanged("playlists");
            await saveTrackToPlaylist(created.id);
        } catch (error) {
            showError(error.message || "Не удалось создать плейлист");
        }
    };

    const toggleFavoriteTrack = async () => {
        if (!track?.id || !user) return;

        const isFavorite = favoriteTrackIds.includes(track.id);

        if (isFavorite) {
            try {
                const res = await authFetch(`${API_URL}/api/playlists/favorites/tracks/${track.id}`, {
                    method: "DELETE"
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || "Не удалось удалить из любимых");
                }

                setFavoriteTrackIds((prev) => prev.filter((id) => id !== track.id));
                emitLibraryChanged("favorites");
                showToast("Удалено из любимых");
            } catch (error) {
                showError(error.message || "Не удалось удалить из любимых");
            }
            return;
        }

        setIsQuickSaveOpen(true);
    };

    return (
        <>
            <footer className={`${styles.grid4} ${theme}`}>
                
                <div className={styles.grid41}>
                    <Footer41 theme={theme} track={track} />
                </div>

                <div className={styles.grid42}>
                    <Footer42
                        theme={theme}
                        track={track}
                        volume={volume}
                        onToggleFavorite={toggleFavoriteTrack}
                        isFavorite={favoriteTrackIds.includes(track?.id)}
                        onPreviousTrack={playPreviousTrack}
                        onNextTrack={playNextTrack}
                        hasPreviousTrack={hasPreviousTrack}
                        hasNextTrack={hasNextTrack}
                    />
                </div>

                <div className={styles.grid43}>
                    <Footer43
                        theme={theme}
                        volume={volume}
                        setVolume={setVolume}
                    />
                </div>

            </footer>

            {isQuickSaveOpen && (
                <QuickSaveModal
                    playlists={userPlaylists}
                    defaultPlaylistId={userPlaylists.find((item) => item.isFavorites)?.id || ""}
                    onClose={() => setIsQuickSaveOpen(false)}
                    onSaveToPlaylist={saveTrackToPlaylist}
                    onCreatePlaylist={createPlaylistAndSaveTrack}
                />
            )}

            {toast && <Toast message={toast} />}
        </>
    );
}

export default Footer;

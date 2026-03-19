// src/layout/4footer/Footer.jsx

import React, { useEffect, useState } from 'react';
import styles from './Footer.module.css';

import Footer41 from './footer41/Footer41';
import Footer42 from './footer42/Footer42';
import Footer43 from './footer43/Footer43';

import PlaylistModal from '../../pages/playlistModal/PlaylistModal';

import { useAuth } from '../../context/auth/AuthContext';
import { API_URL } from '../../components/utils/api/config';
import Toast from '../../components/toast/Toast';

function Footer({ 
    theme, 
    track, 
    setTrack, 
    tracks, 
    setTracks, 
    playlistName, 
    setPlaylistName,
    refreshPlaylists   // ⭐ теперь Footer получает refreshPlaylists
}) {

    const { user, accessToken } = useAuth();

    const [volume, setVolume] = useState(0.1);
    const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
    const [userPlaylists, setUserPlaylists] = useState([]);
    const [toast, setToast] = useState(null);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 2200);
    };

    useEffect(() => {
        if (!user || !accessToken) {
            setUserPlaylists([]);
            return;
        }

        let active = true;

        const loadPlaylists = () => {
            fetch(`${API_URL}/api/playlists/my`, {
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                }
            })
                .then(async (res) => {
                    if (!res.ok) {
                        throw new Error("Не удалось загрузить плейлисты");
                    }
                    return res.json();
                })
                .then((data) => {
                    if (active) setUserPlaylists(data);
                })
                .catch((err) => console.error("Ошибка загрузки плейлистов футера:", err));
        };

        loadPlaylists();
        const intervalId = setInterval(loadPlaylists, 12000);

        return () => {
            active = false;
            clearInterval(intervalId);
        };
    }, [user, accessToken]);

    const togglePlaylist = () => {
        setIsPlaylistOpen(prev => !prev);
    };

    const hasNextTrack = () => {
        if (!tracks || tracks.length === 0) return false;
        const currentIndex = tracks.findIndex(t => t.id === track?.id);
        return currentIndex !== -1 && currentIndex < tracks.length - 1;
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

    const savePlaylist = async (name, tracksToSave) => {
        if (!user || !accessToken) return;

        try {
            const createRes = await fetch(`${API_URL}/api/playlists`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    title: name,
                    description: null
                })
            });

            if (!createRes.ok) throw new Error("Ошибка создания плейлиста");

            const playlist = await createRes.json();

            for (let i = 0; i < tracksToSave.length; i++) {
                await fetch(`${API_URL}/api/playlist-tracks`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({
                        playlistId: playlist.id,
                        trackId: tracksToSave[i].id,
                        order: i
                    })
                });
            }

            console.log("Плейлист успешно сохранён:", playlist.id);

            // ⭐ Обновляем название
            setPlaylistName(name);

            // ⭐ Обновляем список плейлистов
            refreshPlaylists();
            setUserPlaylists((prev) => [playlist, ...prev]);
            showToast("Плейлист сохранён");

        } catch (err) {
            console.error("Ошибка сохранения плейлиста:", err);
            showToast("Не удалось сохранить плейлист");
        }
    };

    const addToExistingPlaylist = async (playlistId, tracksToAdd) => {
        if (!user || !accessToken || !playlistId || !tracksToAdd?.length) return;

        try {
            let addedCount = 0;
            let duplicateCount = 0;

            for (const playlistTrack of tracksToAdd) {
                const res = await fetch(`${API_URL}/api/playlist-tracks`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({
                        playlistId,
                        trackId: playlistTrack.id
                    })
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Ошибка добавления в плейлист");
                }

                if (data.added) addedCount += 1;
                else duplicateCount += 1;
            }

            refreshPlaylists();

            if (addedCount > 0 && duplicateCount > 0) {
                showToast(`Добавлено ${addedCount}, уже было ${duplicateCount}`);
            } else if (addedCount > 0) {
                showToast("Треки добавлены в плейлист");
            } else {
                showToast("Все выбранные треки уже есть в плейлисте");
            }

            setIsPlaylistOpen(false);
        } catch (err) {
            console.error("Ошибка добавления в существующий плейлист:", err);
            showToast(err.message || "Не удалось добавить в существующий плейлист");
        }
    };

    // ⭐ Очистка временного или сохранённого плейлиста
    const clearTempPlaylist = () => {
        setTracks([]);        // очищаем треки
        setTrack(null);       // сбрасываем текущий трек
        setPlaylistName(null); // ⭐ сбрасываем название

        // ⭐ Обновляем список плейлистов (важно!)
        refreshPlaylists();
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
                        onTogglePlaylist={togglePlaylist}
                        onNextTrack={playNextTrack}
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

            {isPlaylistOpen && (
                <PlaylistModal
                    tracks={tracks}
                    currentTrack={track}
                    playlistNameInitial={playlistName}
                    existingPlaylists={userPlaylists}
                    onAddToExisting={addToExistingPlaylist}
                    onSavePlaylist={savePlaylist}
                    onClearTempPlaylist={clearTempPlaylist}
                    onSelect={(t, autoPlay) => {
                        setTrack(t);
                        setIsPlaylistOpen(false);

                        if (autoPlay) {
                            setTimeout(() => {
                                const audio = document.querySelector("audio");
                                if (audio) audio.play();
                            }, 50);
                        }
                    }}
                    onClose={() => setIsPlaylistOpen(false)}
                    theme={theme}
                />
            )}

            {toast && <Toast message={toast} />}
        </>
    );
}

export default Footer;

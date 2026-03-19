// src/pages/myPlaylists/MyPlaylists.jsx

import React, { useState, useEffect, useCallback } from "react";
import styles from "./MyPlaylists.module.css";

import MyPlaylistsLeft from "./myPlaylistsLeft/MyPlaylistsLeft";
import MyPlaylistsRight from "./myPlaylistsRight/MyPlaylistsRight";

import { useAuth } from "../../context/auth/AuthContext";
import { API_URL } from "../../components/utils/api/config";

function MyPlaylists({ 
    tracks,          
    setTracks,       
    setCurrentTrack,
    setPlaylistName,
    searchQuery
}) {

    const { user, accessToken } = useAuth();

    const [playlists, setPlaylists] = useState([]);
    const [selectedId, setSelectedId] = useState(null);

    // ⭐ Универсальная функция обновления плейлистов
    const refreshPlaylists = useCallback(() => {
        if (!user || !accessToken) return;

        fetch(`${API_URL}/api/playlists/my`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        })
            .then(res => res.json())
            .then(data => {
                setPlaylists(data);

                // если выбранный плейлист исчез — сбрасываем выбор
                if (selectedId) {
                    const exists = data.some(p => p.id === selectedId);
                    if (!exists) setSelectedId(null);
                }
            })
            .catch(err => console.error("Ошибка загрузки плейлистов:", err));

    }, [user, accessToken, selectedId]);

    // ⭐ Загружаем плейлисты при входе
    useEffect(() => {
        refreshPlaylists();
    }, [refreshPlaylists]);

    useEffect(() => {
        const intervalId = setInterval(refreshPlaylists, 12000);
        return () => clearInterval(intervalId);
    }, [refreshPlaylists]);

    const selected = playlists.find(p => p.id === selectedId) || null;

    // ⭐ Если плейлист НЕ выбран — сбрасываем название
    useEffect(() => {
        if (!selected) {
            setPlaylistName(null);
        }
    }, [selected, setPlaylistName]);

    // ⭐ Если выбранный плейлист пуст (tracks в Footer пустые) — сбрасываем название
    useEffect(() => {
        if (selected && tracks.length === 0) {
            setPlaylistName(null);
        }
    }, [selected, tracks, setPlaylistName]);

    const createPlaylist = async () => {
        const name = prompt("Название нового плейлиста:");
        if (!name?.trim() || !accessToken) return;

        try {
            const res = await fetch(`${API_URL}/api/playlists`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    title: name.trim(),
                    description: null
                })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Не удалось создать плейлист");
            }

            setPlaylists((prev) => [data, ...prev]);
            setSelectedId(data.id);
        } catch (err) {
            console.error("Ошибка создания плейлиста:", err);
        }
    };

    return (
        <div className={styles.grid3}>
            
            <div className={styles.grid31}>

                <div className={styles.grid311}>
                    <MyPlaylistsLeft
                        playlists={playlists.filter((playlist) => {
                            const query = searchQuery?.trim().toLowerCase();
                            if (!query) return true;
                            return (
                                playlist.title?.toLowerCase().includes(query) ||
                                playlist.description?.toLowerCase().includes(query)
                            );
                        })}
                        selectedId={selectedId}
                        setSelectedId={setSelectedId}
                        onCreatePlaylist={createPlaylist}
                    />
                </div>

                <div className={styles.grid312}>
                    <MyPlaylistsRight
                        playlist={selected}
                        setPlaylists={setPlaylists}

                        // ⭐ Играть один трек
                        onPlayTrack={setCurrentTrack}

                        // ⭐ Играть весь плейлист
                        onPlayPlaylist={(ts) => {
                            setTracks(ts);
                            if (ts.length > 0) setCurrentTrack(ts[0]);
                        }}

                        // ⭐ Позволяем Right менять треки футера
                        setFooterTracks={setTracks}

                        // ⭐ Передаём название плейлиста наверх
                        onSetPlaylistName={setPlaylistName}

                        // ⭐ Передаём функцию обновления плейлистов
                        refreshPlaylists={refreshPlaylists}
                        searchQuery={searchQuery}
                    />
                </div>

            </div>

        </div>
    );
}

export default MyPlaylists;

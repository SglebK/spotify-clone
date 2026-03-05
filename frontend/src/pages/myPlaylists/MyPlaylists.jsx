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
    setPlaylistName
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

    return (
        <div className={styles.grid3}>
            
            <div className={styles.grid31}>

                <div className={styles.grid311}>
                    <MyPlaylistsLeft
                        playlists={playlists}
                        selectedId={selectedId}
                        setSelectedId={setSelectedId}
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
                    />
                </div>

            </div>

        </div>
    );
}

export default MyPlaylists;

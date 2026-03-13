// src/pages/myUploads/MyUploads.jsx
import React, { useEffect, useState } from "react";
import styles from "./MyUploads.module.css";
import { useAuth } from "../../context/auth/AuthContext";
import { API_URL } from "../../components/utils/api/config";
import { fixUrl } from "../../components/utils/fixUrl/fixUrl";

import MyUploadsLeft from "./myUploadsLeft/MyUploadsLeft.jsx";
import MyUploadsRight from "./myUploadsRight/MyUploadsRight.jsx";

function MyUploads({ onPlayTrack, setTracks }) {

    const { accessToken } = useAuth();

    // ⭐ Локальные загруженные треки (НЕ плейлист футера!)
    const [myTracks, setMyTracks] = useState([]);

    const [loading, setLoading] = useState(true);
    const [selectedTrack, setSelectedTrack] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch(`${API_URL}/api/tracks/my`, {
                    headers: {
                        "Authorization": `Bearer ${accessToken}`
                    }
                });

                const data = await res.json();

                // ⭐ сохраняем только локальные треки
                setMyTracks(data);

            } catch (err) {
                console.error("Ошибка загрузки:", err);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [accessToken]);

    const handlePlayTrack = (track) => {
        if (!track) return;

        onPlayTrack({
            ...track,
            audioUrl: fixUrl(track.audioUrl),
            coverUrl: fixUrl(track.coverUrl)
        });
    };

    return (
        <div className={styles.grid3}>
            <div className={styles.grid31}>

                {/* ⭐ Левый список — только загруженные треки */}
                <MyUploadsLeft
                    myTracks={myTracks}
                    loading={loading}
                    selectedTrack={selectedTrack}
                    onSelectTrack={setSelectedTrack}
                />

                {/* ⭐ Правая панель — добавляет трек в плейлист футера */}
                <MyUploadsRight
                    track={selectedTrack}
                    onPlayTrack={handlePlayTrack}
                    setTracks={setTracks}
                    setMyTracks={setMyTracks}
                    setSelectedTrack={setSelectedTrack}
                />
            </div>
        </div>
    );
}

export default MyUploads;


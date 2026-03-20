// src/pages/myUploads/MyUploads.jsx
import React, { useEffect, useState } from "react";
import styles from "./MyUploads.module.css";
import { useAuth } from "../../context/auth/AuthContext";
import { API_URL } from "../../components/utils/api/config";
import { fixUrl } from "../../components/utils/fixUrl/fixUrl";
import TrackFilters from "../../components/trackFilters/TrackFilters.jsx";
import { useError } from "../../context/error/ErrorContext.jsx";
import { authFetch } from "../../components/utils/api/authFetch.js";

import MyUploadsLeft from "./myUploadsLeft/MyUploadsLeft.jsx";
import MyUploadsRight from "./myUploadsRight/MyUploadsRight.jsx";

function MyUploads({ onPlayTrack, setTracks, searchQuery }) {

    const { accessToken } = useAuth();
    const { showError } = useError();

    // ⭐ Локальные загруженные треки (НЕ плейлист футера!)
    const [myTracks, setMyTracks] = useState([]);

    const [loading, setLoading] = useState(true);
    const [selectedTrack, setSelectedTrack] = useState(null);
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");
    const [type, setType] = useState("all");

    useEffect(() => {
        let active = true;

        const load = async () => {
            try {
                const params = new URLSearchParams({
                    search: searchQuery?.trim() || "",
                    sortBy,
                    sortOrder,
                    type
                });

                const res = await authFetch(`${API_URL}/api/tracks/my?${params.toString()}`);

                const data = await res.json();

                if (active) {
                    setMyTracks(data);
                    setSelectedTrack((prev) =>
                        prev ? data.find((item) => item.id === prev.id) || null : null
                    );
                }

            } catch (err) {
                console.error("Ошибка загрузки:", err);
                showError("Не удалось загрузить ваши треки");
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
    }, [accessToken, searchQuery, sortBy, sortOrder, type, showError]);

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
            <TrackFilters
                title="Ваши треки"
                sortBy={sortBy}
                setSortBy={setSortBy}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                type={type}
                setType={setType}
                typeOptions={[
                    { value: "all", label: "Все" },
                    { value: "public", label: "Публичные" },
                    { value: "private", label: "Приватные" }
                ]}
            />

            <div className={styles.grid31}>

                {/* ⭐ Левый список — только загруженные треки */}
                <MyUploadsLeft
                    myTracks={myTracks}
                    loading={loading}
                    selectedTrack={selectedTrack}
                    onSelectTrack={setSelectedTrack}
                    onPlayTrack={handlePlayTrack}
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


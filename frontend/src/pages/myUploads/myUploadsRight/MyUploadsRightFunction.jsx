// src/pages/myUploads/myUploadsRight/MyUploadsRightFunction.jsx

import { useCallback, useEffect, useState } from "react";
import { fixUrl } from "../../../components/utils/fixUrl/fixUrl";
import { API_URL } from "../../../components/utils/api/config";
import { useAuth } from "../../../context/auth/AuthContext";

export function useMyUploadsRightLogic(track, onPlayTrack, setTracks, setMyTracks, setSelectedTrack) {
    const { accessToken } = useAuth();
    const [isPublic, setIsPublic] = useState(track?.isPublic ?? false);

    useEffect(() => {
        setIsPublic(track?.isPublic ?? false);
    }, [track]);

    const editTrack = useCallback(() => {
        if (!track) return;

        const nextTitle = prompt("Новое название трека:", track.title);
        if (nextTitle == null) return;

        const cleanTitle = nextTitle.trim();
        if (!cleanTitle) return;

        const nextArtist = prompt("Новый исполнитель:", track.artist);
        if (nextArtist == null) return;

        const cleanArtist = nextArtist.trim();
        if (!cleanArtist) return;

        fetch(`${API_URL}/api/tracks/${track.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                title: cleanTitle,
                artist: cleanArtist
            })
        })
            .then(async (res) => {
                if (!res.ok) {
                    throw new Error("Не удалось обновить трек");
                }
                return res.json();
            })
            .then((updatedTrack) => {
                setMyTracks((prev) =>
                    prev.map((item) => (item.id === updatedTrack.id ? updatedTrack : item))
                );
                setSelectedTrack(updatedTrack);
            })
            .catch((err) => console.error("Ошибка редактирования трека:", err));
    }, [track, accessToken, setMyTracks, setSelectedTrack]);

    const deleteTrack = useCallback(() => {
        if (!track) return;
        if (!confirm(`Удалить трек "${track.title}"?`)) return;

        fetch(`${API_URL}/api/tracks/${track.id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        })
            .then(async (res) => {
                if (!res.ok) {
                    throw new Error("Не удалось удалить трек");
                }
                return res.json();
            })
            .then(() => {
                setMyTracks((prev) => prev.filter((item) => item.id !== track.id));
                setSelectedTrack(null);
                setTracks((prev) => prev.filter((item) => item.id !== track.id));
            })
            .catch((err) => console.error("Ошибка удаления трека:", err));
    }, [track, accessToken, setMyTracks, setSelectedTrack, setTracks]);

    const togglePublic = useCallback(() => {
        if (!track) return;
        const newValue = !isPublic;

        fetch(`${API_URL}/api/tracks/${track.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify({ isPublic: newValue })
        })
            .then(async (res) => {
                if (!res.ok) {
                    throw new Error("Не удалось изменить публичность");
                }
                return res.json();
            })
            .then((updatedTrack) => {
                setIsPublic(updatedTrack.isPublic);
                setMyTracks((prev) =>
                    prev.map((item) => (item.id === updatedTrack.id ? updatedTrack : item))
                );
                setSelectedTrack(updatedTrack);
            })
            .catch((err) => console.error("Ошибка смены публичности:", err));
    }, [track, isPublic, accessToken, setMyTracks, setSelectedTrack]);

    // ⭐ Добавить в плейлист (в футер)
    const addToPlaylist = useCallback(() => {
        if (!track) return;

        const preparedTrack = {
            ...track,
            audioUrl: fixUrl(track.audioUrl),
            coverUrl: fixUrl(track.coverUrl)
        };

        setTracks(prev => {
            if (prev.some((item) => item.id === preparedTrack.id)) {
                return prev;
            }
            return [...prev, preparedTrack];
        });

    }, [track, setTracks]);

    return {
        isPublic,
        editTrack,
        deleteTrack,
        togglePublic,
        addToPlaylist
    };
}

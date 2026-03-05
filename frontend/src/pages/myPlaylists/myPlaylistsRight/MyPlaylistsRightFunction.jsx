// src/pages/myPlaylists/myPlaylistsRight/MyPlaylistsRightFunction.jsx

import { useEffect, useState } from "react";
import { useAuth } from "../../../context/auth/AuthContext";
import { API_URL } from "../../../components/utils/api/config";

export function useMyPlaylistsRightLogic(playlist, setPlaylists) {

    const { accessToken } = useAuth();
    const [tracks, setTracks] = useState([]);

    // Локальные состояния, чтобы UI обновлялся сразу
    const [title, setTitle] = useState(playlist?.title ?? "");
    const [isPublic, setIsPublic] = useState(playlist?.isPublic ?? false);

    useEffect(() => {
        if (!playlist || !accessToken) return;

        // синхронизация локального состояния с выбранным плейлистом
        setTitle(playlist.title ?? "");
        setIsPublic(playlist.isPublic ?? false);

        // загрузка треков
        fetch(`${API_URL}/api/playlists/${playlist.id}`, {
            headers: { "Authorization": `Bearer ${accessToken}` }
        })
            .then(res => res.json())
            .then(data => setTracks(data.tracks || []))
            .catch(err => console.error("Ошибка загрузки треков:", err));

    }, [playlist, accessToken]);

    // Переименовать плейлист
    const renamePlaylist = async () => {
        const newName = prompt("Новое название:", title);
        if (!newName) return;

        try {
            const res = await fetch(`${API_URL}/api/playlists/${playlist.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                },
                body: JSON.stringify({ Title: newName }) // ← ВАЖНО: backend ждёт Title
            });

            if (!res.ok) throw new Error("Ошибка переименования");

            // обновляем локальное состояние
            setTitle(newName);

            // обновляем список плейлистов
            setPlaylists(prev =>
                prev.map(p => p.id === playlist.id ? { ...p, title: newName } : p)
            );

        } catch (err) {
            console.error(err);
        }
    };

    // Удалить плейлист
    const deletePlaylist = async () => {
        if (!confirm("Удалить плейлист?")) return;

        try {
            await fetch(`${API_URL}/api/playlists/${playlist.id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${accessToken}` }
            });

            setPlaylists(prev => prev.filter(p => p.id !== playlist.id));

        } catch (err) {
            console.error("Ошибка удаления плейлиста:", err);
        }
    };

    // Переключить приватность
    const togglePrivacy = async () => {
        try {
            const newValue = !isPublic;

            const res = await fetch(`${API_URL}/api/playlists/${playlist.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                },
                body: JSON.stringify({ IsPublic: newValue }) // ← backend ждёт IsPublic
            });

            if (!res.ok) throw new Error("Ошибка изменения приватности");

            // обновляем локальное состояние
            setIsPublic(newValue);

            // обновляем список плейлистов
            setPlaylists(prev =>
                prev.map(p =>
                    p.id === playlist.id ? { ...p, isPublic: newValue } : p
                )
            );

        } catch (err) {
            console.error(err);
        }
    };

    return {
        tracks,
        title,
        isPublic,
        renamePlaylist,
        deletePlaylist,
        togglePrivacy
    };
}

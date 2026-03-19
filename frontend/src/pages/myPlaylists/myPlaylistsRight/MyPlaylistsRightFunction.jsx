// src/pages/myPlaylists/myPlaylistsRight/MyPlaylistsRightFunction.jsx

import { useEffect, useState } from "react";
import { useAuth } from "../../../context/auth/AuthContext";
import { API_URL } from "../../../components/utils/api/config";

export function useMyPlaylistsRightLogic(playlist, setPlaylists) {

    const { accessToken } = useAuth();
    const [tracks, setTracks] = useState([]);

    // Локальные состояния, чтобы UI обновлялся сразу
    const [title, setTitle] = useState(playlist?.title ?? "");
    const [description, setDescription] = useState(playlist?.description ?? "");
    const [isPublic, setIsPublic] = useState(playlist?.isPublic ?? false);
    const [coverFile, setCoverFile] = useState(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!playlist || !accessToken) return;

        // синхронизация локального состояния с выбранным плейлистом
        setTitle(playlist.title ?? "");
        setDescription(playlist.description ?? "");
        setIsPublic(playlist.isPublic ?? false);
        setCoverFile(null);

        // загрузка треков
        fetch(`${API_URL}/api/playlists/${playlist.id}`, {
            headers: { "Authorization": `Bearer ${accessToken}` }
        })
            .then(res => res.json())
            .then(data => setTracks(data.tracks || []))
            .catch(err => console.error("Ошибка загрузки треков:", err));

    }, [playlist, accessToken]);

    useEffect(() => {
        if (!message) return;
        const timeoutId = setTimeout(() => setMessage(""), 2200);
        return () => clearTimeout(timeoutId);
    }, [message]);

    const savePlaylistDetails = async () => {
        if (!playlist) return;
        if (!title.trim()) {
            setMessage("Название плейлиста не может быть пустым");
            return;
        }

        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("description", description);
        formData.append("isPublic", String(isPublic));
        if (coverFile) {
            formData.append("cover", coverFile);
        }

        try {
            const res = await fetch(`${API_URL}/api/playlists/${playlist.id}/details`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                },
                body: formData
            });

            const updated = await res.json();
            if (!res.ok) throw new Error(updated.error || "Ошибка обновления плейлиста");

            setPlaylists(prev =>
                prev.map(p => p.id === playlist.id ? { ...p, ...updated } : p)
            );
            setCoverFile(null);
            setMessage("Плейлист обновлён");

        } catch (err) {
            console.error(err);
            setMessage(err.message || "Ошибка обновления плейлиста");
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
        description,
        isPublic,
        coverFile,
        message,
        setTitle,
        setDescription,
        setCoverFile,
        savePlaylistDetails,
        deletePlaylist,
        togglePrivacy
    };
}

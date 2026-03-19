// src/pages/myUploads/myUploadsRight/MyUploadsRightFunction.jsx

import { useCallback, useEffect, useState } from "react";
import { API_URL } from "../../../components/utils/api/config";
import { fixUrl } from "../../../components/utils/fixUrl/fixUrl";
import { useAuth } from "../../../context/auth/AuthContext";

export function useMyUploadsRightLogic(track, onPlayTrack, setTracks, setMyTracks, setSelectedTrack) {
    const { accessToken } = useAuth();
    const [isPublic, setIsPublic] = useState(track?.isPublic ?? false);
    const [playlistMessage, setPlaylistMessage] = useState("");
    const [title, setTitle] = useState(track?.title ?? "");
    const [artist, setArtist] = useState(track?.artist ?? "");
    const [coverFile, setCoverFile] = useState(null);
    const [playlists, setPlaylists] = useState([]);
    const [isPlaylistPickerOpen, setIsPlaylistPickerOpen] = useState(false);
    const [playlistSaving, setPlaylistSaving] = useState(false);

    // The picker modal needs fresh playlists after both "save" and "create + save" flows.
    const loadPlaylists = useCallback(() => {
        if (!accessToken) return Promise.resolve();

        return fetch(`${API_URL}/api/playlists/my`, {
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
                setPlaylists(data);
            });
    }, [accessToken]);

    useEffect(() => {
        setIsPublic(track?.isPublic ?? false);
        setTitle(track?.title ?? "");
        setArtist(track?.artist ?? "");
        setCoverFile(null);
    }, [track]);

    useEffect(() => {
        loadPlaylists().catch((err) => console.error("Ошибка загрузки плейлистов:", err));
    }, [loadPlaylists]);

    useEffect(() => {
        if (!playlistMessage) return;

        const timeoutId = setTimeout(() => setPlaylistMessage(""), 2000);
        return () => clearTimeout(timeoutId);
    }, [playlistMessage]);

    const editTrack = useCallback(() => {
        if (!track) return;
        if (!title.trim() || !artist.trim()) {
            setPlaylistMessage("Заполните название и исполнителя");
            return;
        }

        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("artist", artist.trim());
        formData.append("isPublic", String(isPublic));
        if (coverFile) {
            formData.append("cover", coverFile);
        }

        fetch(`${API_URL}/api/tracks/${track.id}/details`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${accessToken}`
            },
            body: formData
        })
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || "Не удалось обновить трек");
                }
                return data;
            })
            .then((updatedTrack) => {
                setMyTracks((prev) =>
                    prev.map((item) => (item.id === updatedTrack.id ? updatedTrack : item))
                );
                setSelectedTrack(updatedTrack);
                setCoverFile(null);
                setPlaylistMessage("Трек обновлён");
            })
            .catch((err) => {
                console.error("Ошибка редактирования трека:", err);
                setPlaylistMessage(err.message || "Не удалось обновить трек");
            });
    }, [track, title, artist, isPublic, coverFile, accessToken, setMyTracks, setSelectedTrack]);

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

    const addToFavorites = useCallback(() => {
        if (!track) return;

        fetch(`${API_URL}/api/playlists/favorites/tracks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify({ trackId: track.id })
        })
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || "Не удалось добавить трек в любимые");
                }
                return data;
            })
            .then((data) => {
                if (data.added) {
                    setPlaylistMessage("Трек добавлен в любимые");
                } else {
                    setPlaylistMessage("Трек уже есть в любимых");
                }
            })
            .catch((err) => {
                console.error("Ошибка добавления в любимые:", err);
                setPlaylistMessage(err.message || "Ошибка добавления в любимые");
            });
    }, [track, accessToken]);

    const addToQueue = useCallback(() => {
        if (!track) return;

        const preparedTrack = {
            ...track,
            audioUrl: fixUrl(track.audioUrl),
            coverUrl: fixUrl(track.coverUrl)
        };

        let wasAdded = false;
        let shouldStartPlayback = false;

        setTracks((prev) => {
            if (prev.some((item) => item.id === preparedTrack.id)) {
                return prev;
            }

            wasAdded = true;
            shouldStartPlayback = prev.length === 0;
            return [...prev, preparedTrack];
        });

        if (!wasAdded) {
            setPlaylistMessage("Трек уже есть в текущем плейлисте");
            return;
        }

        if (shouldStartPlayback && onPlayTrack) {
            onPlayTrack(preparedTrack);
        }

        setPlaylistMessage("Трек добавлен в очередь плеера");
    }, [track, setTracks, onPlayTrack]);

    // Shared helper avoids duplicating the same POST logic in both playlist actions.
    const addTrackToPlaylist = useCallback(async (playlistId) => {
        if (!track || !playlistId) {
            throw new Error("Сначала выберите плейлист");
        }

        const response = await fetch(`${API_URL}/api/playlist-tracks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                playlistId,
                trackId: track.id
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Не удалось добавить трек в плейлист");
        }

        return data;
    }, [track, accessToken]);

    const addToPlaylist = useCallback(async (playlistId) => {
        setPlaylistSaving(true);

        try {
            const data = await addTrackToPlaylist(playlistId);
            const playlistName = playlists.find((item) => item.id === playlistId)?.title || "плейлист";

            if (data.added) {
                setPlaylistMessage(`Трек добавлен в "${playlistName}"`);
            } else {
                setPlaylistMessage("Этот трек уже есть в выбранном плейлисте");
            }

            setIsPlaylistPickerOpen(false);
            await loadPlaylists();
        } catch (err) {
            console.error("Ошибка добавления в плейлист:", err);
            setPlaylistMessage(err.message || "Не удалось добавить трек в плейлист");
        } finally {
            setPlaylistSaving(false);
        }
    }, [addTrackToPlaylist, playlists, loadPlaylists]);

    const createPlaylistAndAdd = useCallback(async (playlistName) => {
        const cleanTitle = playlistName.trim();
        if (!cleanTitle) {
            setPlaylistMessage("Введите название нового плейлиста");
            return;
        }

        setPlaylistSaving(true);

        try {
            const createRes = await fetch(`${API_URL}/api/playlists`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    title: cleanTitle,
                    description: null
                })
            });

            const createdPlaylist = await createRes.json();

            if (!createRes.ok) {
                throw new Error(createdPlaylist.error || "Не удалось создать плейлист");
            }

            await addTrackToPlaylist(createdPlaylist.id);
            setPlaylistMessage(`Создан плейлист "${cleanTitle}" и трек сохранён`);
            setIsPlaylistPickerOpen(false);
            await loadPlaylists();
        } catch (err) {
            console.error("Ошибка создания плейлиста:", err);
            setPlaylistMessage(err.message || "Не удалось создать плейлист");
        } finally {
            setPlaylistSaving(false);
        }
    }, [accessToken, addTrackToPlaylist, loadPlaylists]);

    return {
        isPublic,
        playlistMessage,
        title,
        artist,
        coverFile,
        playlists,
        isPlaylistPickerOpen,
        playlistSaving,
        setTitle,
        setArtist,
        setCoverFile,
        setIsPlaylistPickerOpen,
        editTrack,
        deleteTrack,
        togglePublic,
        addToPlaylist,
        createPlaylistAndAdd,
        addToQueue,
        addToFavorites
    };
}

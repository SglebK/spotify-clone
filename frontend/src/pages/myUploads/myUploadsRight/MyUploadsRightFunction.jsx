// src/pages/myUploads/myUploadsRight/MyUploadsRightFunction.jsx

import { useCallback, useEffect, useState } from "react";
import { API_URL } from "../../../components/utils/api/config";
import { fixUrl } from "../../../components/utils/fixUrl/fixUrl";
import { useAuth } from "../../../context/auth/AuthContext";
import { authFetch } from "../../../components/utils/api/authFetch.js";
import { emitLibraryChanged } from "../../../components/utils/libraryEvents.js";

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

        return authFetch(`${API_URL}/api/playlists/my`)
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

        authFetch(`${API_URL}/api/tracks/${track.id}/details`, {
            method: "PUT",
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
    }, [track, title, artist, isPublic, coverFile, setMyTracks, setSelectedTrack]);

    const deleteTrack = useCallback(() => {
        if (!track) return;
        if (!confirm(`Удалить трек "${track.title}"?`)) return;

        authFetch(`${API_URL}/api/tracks/${track.id}`, {
            method: "DELETE",
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
    }, [track, setMyTracks, setSelectedTrack, setTracks]);

    const togglePublic = useCallback(() => {
        if (!track) return;
        const newValue = !isPublic;

        authFetch(`${API_URL}/api/tracks/${track.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
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
    }, [track, isPublic, setMyTracks, setSelectedTrack]);

    const addToFavorites = useCallback(() => {
        if (!track) return;

        authFetch(`${API_URL}/api/playlists/favorites/tracks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
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
                emitLibraryChanged("favorites");
            })
            .catch((err) => {
                console.error("Ошибка добавления в любимые:", err);
                setPlaylistMessage(err.message || "Ошибка добавления в любимые");
            });
    }, [track]);

    const addToQueue = useCallback(() => {
        if (!track) return;

        const preparedTrack = {
            ...track,
            audioUrl: fixUrl(track.audioUrl),
            coverUrl: fixUrl(track.coverUrl)
        };

        let wasAdded = false;

        setTracks((prev) => {
            if (prev.some((item) => item.id === preparedTrack.id)) {
                return prev;
            }

            wasAdded = true;
            return [...prev, preparedTrack];
        });

        if (!wasAdded) {
            setPlaylistMessage("Трек уже есть в текущем плейлисте");
            return;
        }

        setPlaylistMessage("Трек добавлен в очередь плеера");
    }, [track, setTracks]);

    // Shared helper avoids duplicating the same POST logic in both playlist actions.
    const addTrackToPlaylist = useCallback(async (playlistId) => {
        if (!track || !playlistId) {
            throw new Error("Сначала выберите плейлист");
        }

        const response = await authFetch(`${API_URL}/api/playlist-tracks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
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
    }, [track]);

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
            emitLibraryChanged("playlists");
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
            const createRes = await authFetch(`${API_URL}/api/playlists`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
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
            emitLibraryChanged("playlists");
        } catch (err) {
            console.error("Ошибка создания плейлиста:", err);
            setPlaylistMessage(err.message || "Не удалось создать плейлист");
        } finally {
            setPlaylistSaving(false);
        }
    }, [addTrackToPlaylist, loadPlaylists]);

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

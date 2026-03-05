// src/pages/myUploads/myUploadsRight/MyUploadsRightFunction.jsx

import { useCallback, useState } from "react";
import { fixUrl } from "../../../components/utils/fixUrl/fixUrl";

export function useMyUploadsRightLogic(track, onPlayTrack, setTracks) {
    // handle null track gracefully by returning no-op actions
    const [isPublic, setIsPublic] = useState(track?.isPublic ?? false);

    const editTrack = useCallback(() => {
        if (!track) return;
        console.log("Изменить трек:", track.id);
    }, [track]);

    const deleteTrack = useCallback(() => {
        if (!track) return;
        console.log("Удалить трек:", track.id);
    }, [track]);

    const togglePublic = useCallback(() => {
        if (!track) return;
        const newValue = !isPublic;
        setIsPublic(newValue);
        console.log("Публичность изменена:", track.id, "=>", newValue);
    }, [track, isPublic]);

    // ⭐ Добавить в плейлист (в футер)
    const addToPlaylist = useCallback(() => {
        if (!track) return;

        const preparedTrack = {
            ...track,
            audioUrl: fixUrl(track.audioUrl),
            coverUrl: fixUrl(track.coverUrl)
        };

        console.log("Добавляем в список футера:", preparedTrack);

        // ⭐ Добавляем в tracks, НЕ трогая текущий трек
        setTracks(prev => [...prev, preparedTrack]);

    }, [track, setTracks]);

    return {
        isPublic,
        editTrack,
        deleteTrack,
        togglePublic,
        addToPlaylist
    };
}

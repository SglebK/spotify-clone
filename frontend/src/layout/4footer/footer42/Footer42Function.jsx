// src/layout/4footer/footer42/Footer42Function.jsx

import { useState, useEffect, useRef } from "react";

export function useFooter42Logic(track, volume, onNextTrack, hasNextTrack) {
    const audioRef = useRef(null);

    const [speed, setSpeed] = useState(1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const [repeatMode, setRepeatMode] = useState("off");

    const toggleRepeat = () => {
        setRepeatMode(prev => {
            if (prev === "off") return "playlist";
            if (prev === "playlist") return "one";
            return "off";
        });
    };

    // ⭐ При смене трека — обновляем src и запускаем воспроизведение
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (!track?.audioUrl) {
            audio.src = "";
            setIsPlaying(false);
            return;
        }

        audio.src = track.audioUrl;
        audio.volume = volume;
        audio.playbackRate = speed;

        audio.play().catch(() => {});
        setIsPlaying(true);

    }, [track, volume, speed]);

    // ⭐ Подписка на события аудио
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => {
            if (!isNaN(audio.currentTime)) {
                setCurrentTime(audio.currentTime);
            }
        };

        const updateDuration = () => {
            if (!isNaN(audio.duration)) {
                setDuration(audio.duration);
            }
        };

        const handleEnded = () => {
            if (repeatMode === "one") {
                audio.currentTime = 0;
                audio.play();
                return;
            }

            if (repeatMode === "playlist") {
                onNextTrack();
                return;
            }

            if (repeatMode === "off") {
                if (hasNextTrack()) onNextTrack();
                else setIsPlaying(false);
            }
        };

        audio.addEventListener("timeupdate", updateTime);
        audio.addEventListener("loadedmetadata", updateDuration);
        audio.addEventListener("ended", handleEnded);

        return () => {
            audio.removeEventListener("timeupdate", updateTime);
            audio.removeEventListener("loadedmetadata", updateDuration);
            audio.removeEventListener("ended", handleEnded);
        };
    }, [repeatMode, onNextTrack, hasNextTrack]);

    // ⭐ Громкость
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    // ⭐ Скорость
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = speed;
        }
    }, [speed]);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            audio.play().catch(() => {});
            setIsPlaying(true);
        }
    };

    const changeSpeed = () => {
        let next = 1;
        if (speed === 1) next = 1.5;
        else if (speed === 1.5) next = 1.75;
        else if (speed === 1.75) next = 2;
        else next = 1;

        setSpeed(next);
    };

    const rewind10 = () => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.currentTime = Math.max(0, audio.currentTime - 10);
    };

    const forward30 = () => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.currentTime = Math.min(audio.duration, audio.currentTime + 30);
    };

    const formatTime = (sec) => {
        if (!sec || isNaN(sec)) return "0:00";
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s < 10 ? "0" + s : s}`;
    };

    return {
        audioRef,
        speed,
        isPlaying,
        currentTime,
        duration,
        repeatMode,

        togglePlay,
        changeSpeed,
        rewind10,
        forward30,
        toggleRepeat,
        formatTime
    };
}

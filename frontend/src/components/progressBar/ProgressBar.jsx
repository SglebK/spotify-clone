// src/components/progressBar/ProgressBar.jsx

import React, { useEffect, useRef, useState } from "react";
import styles from "./ProgressBar.module.css";

export default function ProgressBar({ audioRef }) {
    const barRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragProgress, setDragProgress] = useState(0);
    const [smoothProgress, setSmoothProgress] = useState(0);

    const rafRef = useRef(null);

    // ⭐ Плавное обновление 60 FPS
    useEffect(() => {
        const animate = () => {
            if (!audioRef.current || isDragging) {
                rafRef.current = requestAnimationFrame(animate);
                return;
            }

            const current = audioRef.current.currentTime;
            const duration = audioRef.current.duration || 1;
            const target = (current / duration) * 100;

            // Линейная интерполяция
            const delta = target - smoothProgress;
            const step = delta * 0.15; // скорость сглаживания

            setSmoothProgress((prev) => prev + step);

            rafRef.current = requestAnimationFrame(animate);
        };

        rafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafRef.current);
    }, [audioRef, smoothProgress, isDragging]);

    // ⭐ Клик по полосе
    const handleClick = (e) => {
        if (!audioRef.current) return;

        const rect = barRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = Math.min(Math.max(x / rect.width, 0), 1);

        audioRef.current.currentTime = percent * audioRef.current.duration;
        setSmoothProgress(percent * 100);
    };

    // ⭐ Начало перетаскивания
    const handleMouseDown = (e) => {
        setIsDragging(true);
        if (audioRef.current && !audioRef.current.paused) {
            audioRef.current.pause();
        }
        updateDrag(e);
    };

    // ⭐ Обновление при перетаскивании
    const updateDrag = (e) => {
        const rect = barRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = Math.min(Math.max(x / rect.width, 0), 1);
        setDragProgress(percent * 100);
    };

    // ⭐ Завершение перетаскивания
    const handleMouseUp = () => {
        if (!isDragging) return;
        setIsDragging(false);

        if (audioRef.current) {
            const duration = audioRef.current.duration || 1;
            audioRef.current.currentTime = (dragProgress / 100) * duration;
            audioRef.current.play();
        }
    };

    // ⭐ Слушаем движение мыши
    useEffect(() => {
        const move = (e) => isDragging && updateDrag(e);
        const up = () => handleMouseUp();

        window.addEventListener("mousemove", move);
        window.addEventListener("mouseup", up);

        return () => {
            window.removeEventListener("mousemove", move);
            window.removeEventListener("mouseup", up);
        };
    }, [isDragging, dragProgress]);

    const progress = isDragging ? dragProgress : smoothProgress;

    return (
        <div className={styles.wrapper}>
            <div
                className={styles.bar}
                ref={barRef}
                onMouseDown={handleClick}
            >
                <div
                    className={styles.fill}
                    style={{ width: `${progress}%` }}
                ></div>

                <div
                    className={styles.thumb}
                    style={{ left: `${progress}%` }}
                    onMouseDown={handleMouseDown}
                ></div>
            </div>
        </div>
    );
}

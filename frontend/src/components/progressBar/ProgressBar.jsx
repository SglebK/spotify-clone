// src/components/progressBar/ProgressBar.jsx

import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./ProgressBar.module.css";

export default function ProgressBar({ audioRef }) {
    const barRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragProgress, setDragProgress] = useState(0);
    const [smoothProgress, setSmoothProgress] = useState(0);
    const smoothProgressRef = useRef(0);

    const rafRef = useRef(null);

    useEffect(() => {
        const animate = () => {
            if (!audioRef.current || isDragging) {
                rafRef.current = requestAnimationFrame(animate);
                return;
            }

            const current = audioRef.current.currentTime;
            const duration = audioRef.current.duration || 1;
            const target = (current / duration) * 100;

            setSmoothProgress((prev) => {
                const delta = target - prev;
                const next = Math.abs(delta) < 0.15 ? target : prev + delta * 0.18;
                smoothProgressRef.current = next;
                return next;
            });

            rafRef.current = requestAnimationFrame(animate);
        };

        rafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafRef.current);
    }, [audioRef, isDragging]);

    useEffect(() => {
        if (!audioRef.current?.src) {
            smoothProgressRef.current = 0;
            setSmoothProgress(0);
            setDragProgress(0);
        }
    }, [audioRef, audioRef.current?.src]);

    // ⭐ Клик по полосе
    const handleClick = (e) => {
        if (!audioRef.current) return;

        const rect = barRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = Math.min(Math.max(x / rect.width, 0), 1);

        audioRef.current.currentTime = percent * audioRef.current.duration;
        smoothProgressRef.current = percent * 100;
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
    const handleMouseUp = useCallback(() => {
        if (!isDragging) return;
        setIsDragging(false);

        if (audioRef.current) {
            const duration = audioRef.current.duration || 1;
            audioRef.current.currentTime = (dragProgress / 100) * duration;
            smoothProgressRef.current = dragProgress;
            setSmoothProgress(dragProgress);
            audioRef.current.play();
        }
    }, [audioRef, dragProgress, isDragging]);

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
    }, [isDragging, dragProgress, handleMouseUp]);

    const progress = isDragging ? dragProgress : smoothProgress;

    return (
        <div className={styles.wrapper}>
            <div
                className={styles.bar}
                ref={barRef}
                onMouseDown={handleClick}
                style={{
                    background: `linear-gradient(to right, var(--progress-bg) 0%, var(--progress-bg) ${progress}%, var(--progress-fill) ${progress}%, var(--progress-fill) 100%)`
                }}
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

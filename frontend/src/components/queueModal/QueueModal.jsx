import React, { useEffect, useRef, useState } from "react";
import styles from "./QueueModal.module.css";
import { fixUrl } from "@helpers/fixUrl";
import QuickSaveModal from "@components/quickSaveModal/QuickSaveModal.jsx";
function QueueModal({ tracks, currentTrack, onClose, onSelectTrack, setTracks }) {
    const listRef = useRef(null);
    const dragItem = useRef(null);
    const dragOverItem = useRef(null);
    const [quickSaveTracks, setQuickSaveTracks] = useState([]);
    const [showQuickSave, setShowQuickSave] = useState(false);
    useEffect(() => {
        if (!currentTrack) return;
        const el = listRef.current?.querySelector(`[data-id="${currentTrack.id}"]`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, [currentTrack]);
    const removeFromQueue = (id) => {
        setTracks(prev => prev.filter(t => t.id !== id));
    };
    const clearQueue = () => {
        setTracks([]);
    };
    const playAll = () => {
        if (tracks.length > 0) {
            onSelectTrack(tracks[0]);
        }
    };
    const handleDragStart = (index) => {
        dragItem.current = index;
    };
    const handleDragEnter = (index) => {
        dragOverItem.current = index;
    };
    const handleDragEnd = () => {
        const copy = [...tracks];
        const dragged = copy[dragItem.current];
        copy.splice(dragItem.current, 1);
        copy.splice(dragOverItem.current, 0, dragged);
        dragItem.current = null;
        dragOverItem.current = null;
        setTracks(copy);
    };
    return (
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.closeIcon} onClick={onClose}>✕</div>
            <h2 className={styles.title}>Очередь воспроизведения</h2>
            <div className={styles.actions}>
                <button className={styles.actionBtn} onClick={playAll}>
                    ▶ Начать
                </button>
                <button className={styles.actionBtn} onClick={clearQueue}>
                    ✕ Очистить
                </button>
                <button
                    className={styles.actionBtn}
                    onClick={() => {
                        if (tracks.length > 0) {
                            setQuickSaveTracks(tracks);
                            setShowQuickSave(true);
                        }
                    }}
                >
                    💾 Сохранить очередь
                </button>
            </div>
            <div className={styles.list} ref={listRef}>
                {tracks.length === 0 && (
                    <p className={styles.empty}>Очередь пуста</p>
                )}
                {tracks.map((track, index) => (
                    <div
                        key={`${track.id}-${index}`}   
                        data-id={track.id}
                        className={`${styles.item} ${currentTrack?.id === track.id ? styles.active : ""}`}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragEnter={() => handleDragEnter(index)}
                        onDragEnd={handleDragEnd}
                    >
                        <img
                            src={fixUrl(track.coverUrl)}
                            alt={track.title}
                            className={styles.cover}
                        />
                        <div className={styles.info} onClick={() => onSelectTrack(track)}>
                            <p className={styles.titleText}>{track.title}</p>
                            <p className={styles.artist}>{track.artist}</p>
                        </div>
                        <button
                            className={styles.removeBtn}
                            onClick={() => removeFromQueue(track.id)}
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
            {showQuickSave && (
                <QuickSaveModal
                    tracks={quickSaveTracks}
                    onClose={() => setShowQuickSave(false)}
                    onSaved={() => {
                        clearQueue();
                        onClose();
                    }}
                />
            )}
        </div>
    );
}
export default QueueModal;

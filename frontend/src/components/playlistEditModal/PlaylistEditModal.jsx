import React, { useState } from "react";
import styles from "./PlaylistEditModal.module.css";
import api from "@api/axios";
import { fixUrl } from "@helpers/fixUrl";
import { emitLibraryChanged } from "@helpers/libraryEvents";
function PlaylistEditModal({ playlist, onClose, deletePlaylist }) {
    const [title, setTitle] = useState(playlist.title);
    const [description, setDescription] = useState(playlist.description || "");
    const [isPublic, setIsPublic] = useState(playlist.isPublic);
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(
        fixUrl(playlist.coverUrl) || "/default-cover.png"
    );
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setCoverFile(file);
        setCoverPreview(URL.createObjectURL(file));
    };
    const handleSave = async () => {
        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("isPublic", isPublic);
            if (coverFile) {
                formData.append("cover", coverFile);
            }
            await api.put(
                `/api/playlists/${playlist.id}/details`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" }
                }
            );
            emitLibraryChanged("playlist-updated");
            onClose();
        } catch (err) {
            alert(err.message);
        }
    };
    const handleDelete = async () => {
        if (!confirm("Удалить этот плейлист?")) return;
        await deletePlaylist(playlist.id);
        emitLibraryChanged("playlist-updated");
        onClose();
    };
    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <button className={styles.closeButton} onClick={onClose}></button>
                <h2 className={styles.heading}>Редактировать плейлист</h2>
                <div className={styles.coverBlock}>
                    <img src={coverPreview} alt="cover" className={styles.cover} />
                    <label className={styles.coverButton}>
                        Заменить обложку
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            hidden
                        />
                    </label>
                </div>
                <label className={styles.label}>Название</label>
                <input
                    className={styles.input}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <label className={styles.label}>Описание</label>
                <textarea
                    className={styles.textarea}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                {!playlist.isFavorites && (
                    <label className={styles.checkboxRow}>
                        <input
                            type="checkbox"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                        />
                        Публичный плейлист
                    </label>
                )}
                <div className={styles.actionRow}>
                    <div className={styles.actionCell}>
                        <button className={styles.save} onClick={handleSave}>
                            Сохранить
                        </button>
                    </div>
                    {!playlist.isFavorites && (
                        <div className={styles.actionCell}>
                            <button className={styles.delete} onClick={handleDelete}>
                                Выкинуть
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
export default PlaylistEditModal;

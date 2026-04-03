import React, { useState } from "react";
import styles from "./UploadTrack.module.css";
import api from "@api/axios";
import { useNavigate } from "react-router-dom";
import { useError } from "@context/ErrorContext.jsx";
const MAX_AUDIO_SIZE = 20 * 1024 * 1024;
const MAX_COVER_SIZE = 5 * 1024 * 1024;
const ALLOWED_AUDIO_TYPES = [
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/x-wav",
    "audio/ogg",
    "audio/mp4"
];
const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg"
];
function UploadTrack() {
    const { showError } = useError();
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [artist, setArtist] = useState("");
    const [audio, setAudio] = useState(null);
    const [cover, setCover] = useState(null);
    const [message, setMessage] = useState("");
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !artist.trim()) {
            setMessage("Заполните название и исполнителя");
            return;
        }
        if (!audio) {
            setMessage("Выберите аудиофайл");
            return;
        }
        if (!ALLOWED_AUDIO_TYPES.includes(audio.type)) {
            setMessage("Допустимы только MP3, WAV, OGG или M4A");
            return;
        }
        if (audio.size > MAX_AUDIO_SIZE) {
            setMessage("Аудиофайл слишком большой. Максимум 20 МБ");
            return;
        }
        if (cover && !ALLOWED_IMAGE_TYPES.includes(cover.type)) {
            setMessage("Обложка должна быть JPG, PNG или WEBP");
            return;
        }
        if (cover && cover.size > MAX_COVER_SIZE) {
            setMessage("Обложка слишком большая. Максимум 5 МБ");
            return;
        }
        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("artist", artist.trim());
        formData.append("audio", audio);
        if (cover) formData.append("cover", cover);
        try {
            await api.post("/api/tracks/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            setMessage("Трек успешно загружен!");
            setTitle("");
            setArtist("");
            setAudio(null);
            setCover(null);
            setTimeout(() => {
                navigate("/myUploads");
            }, 800);
        } catch (err) {
            const msg = err.response?.data?.error || "Не удалось загрузить трек";
            setMessage("Ошибка: " + msg);
            showError(msg);
        }
    };
    return (
        <div className={styles.wrapper}>
            <div className={styles.card}>
                <div className="closeButton" onClick={() => navigate("/")}>
                    ✖
                </div>
                <div className={styles.grid3A}>
                    <div className={styles.grid31}>
                        <h1 className={styles.title}>Загрузить трек</h1>
                    </div>
                    <div className={styles.grid32}>
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <label className={styles.label}>
                                Название трека:
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    className="input"
                                />
                            </label>
                            <label className={styles.label}>
                                Исполнитель:
                                <input
                                    type="text"
                                    value={artist}
                                    onChange={(e) => setArtist(e.target.value)}
                                    required
                                    className="input"
                                />
                            </label>
                            <label className={styles.label}>
                                Аудиофайл (MP3):
                                <input
                                    type="file"
                                    accept="audio/*"
                                    onChange={(e) => setAudio(e.target.files[0])}
                                    required
                                    className={styles.inputFile}
                                />
                            </label>
                            <label className={styles.label}>
                                Обложка (необязательно):
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setCover(e.target.files[0])}
                                    className={styles.inputFile}
                                />
                            </label>
                            <button type="submit" className="button">
                                Загрузить
                            </button>
                        </form>
                    </div>
                    <div className={styles.grid33}>
                        {message && <p className={styles.message}>{message}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
export default UploadTrack;

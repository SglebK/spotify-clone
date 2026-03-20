// src/pages/uploadTrack/UploadTrack.jsx

import React, { useState } from "react";
import styles from "./UploadTrack.module.css";
import { API_URL } from "../../components/utils/api/config";
import { useNavigate } from "react-router-dom";
import { useError } from "../../context/error/ErrorContext.jsx";
import { authFetch } from "../../components/utils/api/authFetch.js";

const MAX_AUDIO_SIZE = 20 * 1024 * 1024;
const MAX_COVER_SIZE = 5 * 1024 * 1024;
const ALLOWED_AUDIO_TYPES = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/ogg", "audio/mp4"];
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

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
            const res = await authFetch(`${API_URL}/api/tracks/upload`, {
                method: "POST",
                body: formData
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Ошибка загрузки");

            setMessage("Трек успешно загружен!");

            // очищаем форму
            setTitle("");
            setArtist("");
            setAudio(null);
            setCover(null);

            // ⭐ Переход на страницу загруженных треков
            setTimeout(() => {
                navigate("/myUploads");
            }, 800);

        } catch (err) {
            setMessage("Ошибка: " + err.message);
            showError(err.message || "Не удалось загрузить трек");
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

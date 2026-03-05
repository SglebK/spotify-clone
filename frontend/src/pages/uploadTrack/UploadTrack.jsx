// src/pages/uploadTrack/UploadTrack.jsx

import React, { useState } from "react";
import styles from "./UploadTrack.module.css";
import { useAuth } from "../../context/auth/AuthContext";
import { API_URL } from "../../components/utils/api/config";
import { useNavigate } from "react-router-dom";

function UploadTrack() {
    const { accessToken } = useAuth();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
       const [artist, setArtist] = useState("");
    const [audio, setAudio] = useState(null);
    const [cover, setCover] = useState(null);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!audio) {
            setMessage("Выберите аудиофайл");
            return;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("artist", artist);
        formData.append("audio", audio);
        if (cover) formData.append("cover", cover);

        try {
            const res = await fetch(`${API_URL}/api/tracks/upload`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                },
                body: formData
            });

            if (!res.ok) throw new Error("Ошибка загрузки");

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

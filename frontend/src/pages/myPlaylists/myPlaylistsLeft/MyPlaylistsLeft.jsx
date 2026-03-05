// src/pages/myPlaylists/myPlaylistsLeft/MyPlaylistsLeft.jsx

import React from "react";
import styles from "./MyPlaylistsLeft.module.css";

function MyPlaylistsLeft({ playlists, selectedId, setSelectedId }) {

    return (
        <div className={styles.left}>
            <h2 className={styles.title}>Мои плейлисты</h2>

            <div className={styles.list}>
                {playlists.length === 0 && (
                    <div className={styles.empty}>У вас пока нет плейлистов</div>
                )}

                {playlists.map(pl => (
                    <div
                        key={pl.id}
                        className={`${styles.item} ${selectedId === pl.id ? styles.active : ""}`}
                        onClick={() => setSelectedId(pl.id)}
                    >
                        {pl.title}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MyPlaylistsLeft;

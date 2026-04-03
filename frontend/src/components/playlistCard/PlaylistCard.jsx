import React from "react";
import styles from "./PlaylistCard.module.css";
function PlaylistCard({ playlist, active, onClick }) {
    return (
        <div
            className={`${styles.cardWrapper} ${
                active ? styles.activeWrapper : ""
            }`}
        >
            <button
                type="button"
                className={styles.cardButton}
                onClick={onClick}
            >
                <span className={styles.title}>{playlist.title}</span>

                <span className={styles.meta}>
                    {playlist.trackCount} треков
                </span>
            </button>
        </div>
    );
}
export default PlaylistCard;

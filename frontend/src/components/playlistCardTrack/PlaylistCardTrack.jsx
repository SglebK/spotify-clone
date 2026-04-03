import React from "react";
import styles from "./PlaylistCardTrack.module.css";
import { fixUrl } from "@helpers/fixUrl";
function PlaylistCardTrack({ track, onPlay }) {
    return (
        <div className={styles.row} onClick={() => onPlay(track)}>
            <img
                src={fixUrl(track.coverUrl) || "/default-cover.png"}
                alt={track.title}
                className={styles.cover}
            />
            <div className={styles.text}>
                <div className={styles.title}>{track.title}</div>
                <div className={styles.artist}>{track.artist}</div>
            </div>
        </div>
    );
}
export default PlaylistCardTrack;

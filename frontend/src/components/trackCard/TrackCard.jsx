import React from "react";
import styles from "./TrackCard.module.css";
import { fixUrl } from "@helpers/fixUrl";
function TrackCard({ track, onOpen }) {
  return (
    <div className={styles.card} onClick={() => onOpen(track)}>
      <img
        src={fixUrl(track.coverUrl) || "/default-cover.png"}
        alt={track.title}
        className={styles.cover}
      />
      <p className={styles.trackTitle}>{track.title}</p>
      <p className={styles.artist}>{track.artist}</p>
    </div>
  );
}
export default TrackCard;

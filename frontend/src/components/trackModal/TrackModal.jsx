import React from "react";
import styles from "./TrackModal.module.css";
import { fixUrl } from "@helpers/fixUrl";
import DownloadButton from "@components/downloadButton/DownloadButton.jsx";
function TrackModal({
  track,
  onClose,
  onPlay,
  onAdd,
  onAddToPlaylist,
  onDelete,
  onTogglePublic,
  user,
  mode
}) {
  if (!track) return null;
  const isOwner = user && track.userId === user.id;
  const isAdmin = !!user?.isAdmin;
  const isPublic = !!track.isPublic;
  return (
    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
      <button className={styles.closeButton} onClick={onClose}></button>
      <img src={fixUrl(track.coverUrl)} alt={track.title} className={styles.cover} />
      <h2>{track.title}</h2>
      <p>{track.artist}</p>
      <div className={styles.buttonGrid}>
        <button
          className={styles.button}
          onClick={() => {
            onPlay(track);
            onClose();
          }}
        >
          Слушать
        </button>
        <button
          className={styles.button}
          onClick={() => {
            onAdd(track);
            onClose();
          }}
        >
          В очередь
        </button>
        <button
          className={styles.button}
          onClick={() => {
            onAddToPlaylist(track);
            onClose();
          }}
        >
          Добавить в плейлист
        </button>
        <DownloadButton
          track={track}
          className={`${styles.button} ${styles.download}`}
        />
      </div>
      {mode === "catalog" && (isOwner || isAdmin) && (
        <button
          className={`${styles.button} ${styles.makePrivate}`}
          onClick={() => {
            onDelete(track.id);
            onClose();
          }}
        >
          {isOwner ? "Сделать приватным" : "Удалить как админ"}
        </button>
      )}
      {mode === "myUploads" && (
        <>
          {isOwner && (
            <label className={styles.privacyToggle}>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={() => onTogglePublic(track.id)}
              />
              Публичный
            </label>
          )}
          <button
            className={`${styles.button} ${styles.delete}`}
            onClick={() => {
              onDelete(track.id);
              onClose();
            }}
          >
            Удалить
          </button>
        </>
      )}
    </div>
  );
}
export default TrackModal;

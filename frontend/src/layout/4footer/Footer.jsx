import React, { useEffect, useState } from "react";
import styles from "./Footer.module.css";
import Footer41 from "./footer41/Footer41";
import Footer42 from "./footer42/Footer42";
import Footer43 from "./footer43/Footer43";
import QuickSaveModal from "@components/quickSaveModal/QuickSaveModal.jsx";
import { useAuth } from "@context/AuthContext";
import Toast from "@components/toast/Toast";
import { useError } from "@context/ErrorContext.jsx";
import { emitLibraryChanged } from "@helpers/libraryEvents.js";
import api from "@api/axios";

function Footer({
  theme,
  track,
  setTrack,
  tracks,
  onOpenQueue,
  volume,
  setVolume
}) {
  const { user } = useAuth();
  const { showError } = useError();
  const [favoriteTrackIds, setFavoriteTrackIds] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [isQuickSaveOpen, setIsQuickSaveOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2200);
  };

  const favoritesPlaylist = userPlaylists.find((playlist) => playlist.isFavorites);

  useEffect(() => {
    if (!user || !user.id) {
      setFavoriteTrackIds([]);
      setUserPlaylists([]);
      return;
    }

    let active = true;
    const loadLibrary = async () => {
      try {
        const [favoritesRes, playlistsRes] = await Promise.all([
          api.get("/api/playlists/favorites"),
          api.get("/api/playlists/my")
        ]);
        if (!active) return;
        setFavoriteTrackIds((favoritesRes.data.tracks || []).map((t) => t.id));
        setUserPlaylists(playlistsRes.data);
      } catch (error) {
        console.error("Ошибка загрузки библиотеки футера:", error);
      }
    };

    const handleLibraryChanged = () => loadLibrary();
    loadLibrary();
    const intervalId = setInterval(loadLibrary, 12000);
    window.addEventListener("library:changed", handleLibraryChanged);

    return () => {
      active = false;
      clearInterval(intervalId);
      window.removeEventListener("library:changed", handleLibraryChanged);
    };
  }, [user?.id]);

  const hasNextTrack = () => {
    if (!tracks?.length) return false;
    const currentIndex = tracks.findIndex((t) => t.id === track?.id);
    return currentIndex !== -1 && currentIndex < tracks.length - 1;
  };

  const hasPreviousTrack = () => {
    if (!tracks?.length) return false;
    const currentIndex = tracks.findIndex((t) => t.id === track?.id);
    return currentIndex > 0;
  };

  const playPreviousTrack = () => {
    if (!tracks?.length) return;
    const currentIndex = tracks.findIndex((t) => t.id === track?.id);
    if (currentIndex > 0) setTrack(tracks[currentIndex - 1]);
    else setTrack(tracks[0]);
  };

  const playNextTrack = () => {
    if (!tracks?.length) return;
    const currentIndex = tracks.findIndex((t) => t.id === track?.id);
    if (currentIndex === -1) return setTrack(tracks[0]);
    const nextIndex = currentIndex + 1;
    if (nextIndex < tracks.length) setTrack(tracks[nextIndex]);
    else setTrack(tracks[0]);
  };

  const toggleFavoriteTrack = async () => {
    if (!track?.id || !user) return;
    const isFavorite = favoriteTrackIds.includes(track.id);

    try {
      if (isFavorite) {
        await api.delete(`/api/playlists/favorites/tracks/${track.id}`);
        setFavoriteTrackIds((prev) => prev.filter((id) => id !== track.id));
        emitLibraryChanged("favorites");
        showToast("Удалено из любимых");
      } else {
        setIsQuickSaveOpen(true);
      }
    } catch (error) {
      showError(error.response?.data?.error || "Ошибка при обновлении любимых");
    }
  };

  return (
    <>
      <footer className={`${styles.grid4} ${theme}`}>
        <div className={styles.grid41}>
          <Footer41 theme={theme} track={track} />
        </div>
        <div className={styles.grid42}>
          <Footer42
            theme={theme}
            track={track}
            volume={volume}
            onToggleFavorite={toggleFavoriteTrack}
            isFavorite={favoriteTrackIds.includes(track?.id)}
            onPreviousTrack={playPreviousTrack}
            onNextTrack={playNextTrack}
            hasPreviousTrack={hasPreviousTrack}
            hasNextTrack={hasNextTrack}
            onOpenQueue={onOpenQueue}
          />
        </div>
        <div className={styles.grid43}>
          <Footer43 theme={theme} volume={volume} setVolume={setVolume} />
        </div>
      </footer>
      {isQuickSaveOpen && (
        <QuickSaveModal
          track={track}
          playlists={userPlaylists}
          preferredPlaylistId={favoritesPlaylist?.id || ""}
          saveOnClose
          onSaved={(playlistId) => {
            if (playlistId === favoritesPlaylist?.id && track?.id) {
              setFavoriteTrackIds((prev) => (
                prev.includes(track.id) ? prev : [...prev, track.id]
              ));
              emitLibraryChanged("favorites");
              showToast("Добавлено в любимые");
            } else {
              emitLibraryChanged("playlist-updated");
              showToast("Сохранено в плейлист");
            }
          }}
          onClose={() => setIsQuickSaveOpen(false)}
        />
      )}
      {toast && <Toast message={toast} />}
    </>
  );
}

export default Footer;

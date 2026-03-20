// src/App.jsx
import { BrowserRouter as Router } from 'react-router-dom';
import { useState, useEffect } from 'react';
import styles from './App.module.css';

import Header from './layout/1header/Header';
import Aside from './layout/2aside/Aside';
import Navigator from './layout/3navigator/Navigator';
import Footer from './layout/4footer/Footer';

const PLAYER_TRACK_KEY = 'spotify-clone-current-track';
const PLAYER_QUEUE_KEY = 'spotify-clone-player-queue';
const PLAYER_NAME_KEY = 'spotify-clone-player-playlist-name';

function readStoredValue(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  // ⭐ Единый текущий трек
  const [currentTrack, setCurrentTrackState] = useState(() => readStoredValue(PLAYER_TRACK_KEY, null));

  // ⭐ Единый плейлист для плеера и модалки
  const [tracks, setTracks] = useState(() => readStoredValue(PLAYER_QUEUE_KEY, []));

  // ⭐ Единое название плейлиста (временного или сохранённого)
  const [playlistName, setPlaylistName] = useState(() => readStoredValue(PLAYER_NAME_KEY, null));
  const [searchQuery, setSearchQuery] = useState("");

  const setCurrentTrack = (nextTrack) => {
    setCurrentTrackState(nextTrack || null);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(PLAYER_TRACK_KEY, JSON.stringify(currentTrack));
  }, [currentTrack]);

  useEffect(() => {
    localStorage.setItem(PLAYER_QUEUE_KEY, JSON.stringify(tracks));
  }, [tracks]);

  useEffect(() => {
    localStorage.setItem(PLAYER_NAME_KEY, JSON.stringify(playlistName));
  }, [playlistName]);

  useEffect(() => {
    if (!currentTrack?.id) return;

    setTracks((prev) => {
      if (prev.some((item) => item.id === currentTrack.id)) {
        return prev;
      }

      return [currentTrack, ...prev];
    });
  }, [currentTrack]);

  const handlePlayTrack = (track) => {
    setCurrentTrack(track || null);
  };

  return (
    <Router>
      <div className={`${styles.grid} ${styles[theme]} ${theme}`}>
        
        <div className={styles.grid1}>
          <Header
            theme={theme}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            currentTrack={currentTrack}
          />
        </div>

        <div className={styles.grid2}>
          <Aside theme={theme} />
        </div>

        <div className={styles.grid3}>
          <Navigator
            theme={theme}
            setTheme={setTheme}

            // ⭐ Управление текущим треком
            setTrack={handlePlayTrack}

            // ⭐ Управление плейлистом
            tracks={tracks}
            setTracks={setTracks}

            // ⭐ Управление текущим треком
            currentTrack={currentTrack}
            setCurrentTrack={setCurrentTrack}

            // ⭐ Передаём название плейлиста
            playlistName={playlistName}
            setPlaylistName={setPlaylistName}
            searchQuery={searchQuery}
          />
        </div>

        <div className={styles.grid4}>
          <Footer
            theme={theme}
            track={currentTrack}
            setTrack={handlePlayTrack}
            tracks={tracks}
            setTracks={setTracks}
            playlistName={playlistName}
            setPlaylistName={setPlaylistName}
            refreshPlaylists={() => {}}
          />
        </div>

      </div>
    </Router>
  );
}

export default App;

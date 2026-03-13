// src/App.jsx
import { BrowserRouter as Router } from 'react-router-dom';
import { useState, useEffect } from 'react';
import styles from './App.module.css';

import Header from './layout/1header/Header';
import Aside from './layout/2aside/Aside';
import Navigator from './layout/3navigator/Navigator';
import Footer from './layout/4footer/Footer';

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  // ⭐ Единый текущий трек
  const [currentTrack, setCurrentTrack] = useState(null);

  // ⭐ Единый плейлист для плеера и модалки
  const [tracks, setTracks] = useState([]);

  // ⭐ Единое название плейлиста (временного или сохранённого)
  const [playlistName, setPlaylistName] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <Router>
      <div className={`${styles.grid} ${styles[theme]} ${theme}`}>
        
        <div className={styles.grid1}>
          <Header theme={theme} />
        </div>

        <div className={styles.grid2}>
          <Aside theme={theme} />
        </div>

        <div className={styles.grid3}>
          <Navigator
            theme={theme}
            setTheme={setTheme}

            // ⭐ Управление текущим треком
            setTrack={setCurrentTrack}

            // ⭐ Управление плейлистом
            tracks={tracks}
            setTracks={setTracks}

            // ⭐ Управление текущим треком
            currentTrack={currentTrack}
            setCurrentTrack={setCurrentTrack}

            // ⭐ Передаём название плейлиста
            playlistName={playlistName}
            setPlaylistName={setPlaylistName}
          />
        </div>

        <div className={styles.grid4}>
          <Footer
            theme={theme}
            track={currentTrack}
            setTrack={setCurrentTrack}
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

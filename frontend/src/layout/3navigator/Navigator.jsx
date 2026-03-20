// src/layout/3navigator/Navigator.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import styles from './Navigator.module.css';

import Home from '../../pages/home/Home';
import Configuration from '../../pages/configuration/Configuration';
import Login from '../../pages/login/Login';
import Register from '../../pages/register/Register';
import PrivateRoute from '../../components/PrivateRoute.jsx';
import NotFound from '../../pages/notFound/NotFound.jsx';
import Page0 from '../../pages/page0/Page0.jsx';
import HomeDark from '../../pages/home/HomeDark.jsx';
import MyPlaylists from '../../pages/myPlaylists/MyPlaylists.jsx';
import UploadTrack from '../../pages/uploadTrack/UploadTrack.jsx';
import MyUploads from "../../pages/myUploads/MyUploads.jsx";
import AllPlaylists from "../../pages/allPlaylists/AllPlaylists.jsx";
import Premium from "../../pages/premium/Premium.jsx";
import Help from "../../pages/help/Help.jsx";
import SearchResults from "../../pages/searchResults/SearchResults.jsx";
import Favorites from "../../pages/favorites/Favorites.jsx";

function Navigator({ 
  theme, 
  setTheme, 
  setTrack, 
  tracks, 
  setTracks,
  currentTrack,
  setCurrentTrack,
  playlistName,
  setPlaylistName,
  searchQuery
}) {
  const hasSearch = searchQuery?.trim().length > 0;

  if (hasSearch) {
    return (
      <div className={`${styles.grid3} ${styles[theme]}`}>
        <SearchResults
          searchQuery={searchQuery}
          onPlayTrack={setTrack}
          setTracks={setTracks}
          setCurrentTrack={setCurrentTrack}
          setPlaylistName={setPlaylistName}
        />
      </div>
    );
  }

  return (
    <div className={`${styles.grid3} ${styles[theme]}`}>
      <Routes>

        <Route path="/" element={<Home theme={theme} />} />
        <Route path="/home-dark" element={<HomeDark />} />
        <Route path="/premium" element={<Premium />} />
        <Route path="/help" element={<Help />} />

        <Route
          path="/configuration"
          element={<Configuration theme={theme} setTheme={setTheme} />}
        />

        <Route
          path="/page0"
          element={
            <Page0
              onSelectTrack={setTrack}
              tracks={tracks}
              setTracks={setTracks}
              setPlaylistName={setPlaylistName}
              searchQuery={searchQuery}
            />
          }
        />

        <Route
          path="/playlists"
          element={
            <AllPlaylists
              onPlayTrack={setTrack}
              setTracks={setTracks}
              setCurrentTrack={setCurrentTrack}
              setPlaylistName={setPlaylistName}
              searchQuery={searchQuery}
            />
          }
        />

        <Route
          path="/myPlaylists"
          element={
            <PrivateRoute>
              <MyPlaylists
                tracks={tracks}
                setTracks={setTracks}
                currentTrack={currentTrack}
                setCurrentTrack={setCurrentTrack}
                playlistName={playlistName}
                setPlaylistName={setPlaylistName}
                searchQuery={searchQuery}
              />
            </PrivateRoute>
          }
        />

        <Route
          path="/upload-track"
          element={
            <PrivateRoute>
              <UploadTrack />
            </PrivateRoute>
          }
        />

        <Route
          path="/myUploads"
          element={
            <PrivateRoute>
              <MyUploads 
                onPlayTrack={setTrack}
                tracks={tracks}          // плейлист футера
                setTracks={setTracks}    // обновление плейлиста футера
                searchQuery={searchQuery}
              />
            </PrivateRoute>
          }
        />

        <Route
          path="/favorites"
          element={
            <PrivateRoute>
              <Favorites
                onPlayTrack={setTrack}
                tracks={tracks}
                setTracks={setTracks}
                setPlaylistName={setPlaylistName}
              />
            </PrivateRoute>
          }
        />


        <Route path="/login" element={<Login theme={theme} />} />
        <Route path="/register" element={<Register theme={theme} />} />

        <Route path="*" element={<NotFound />} />

      </Routes>
    </div>
  );
}

export default Navigator;

import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import styles from "./SearchResults.module.css";
import api from "@api/axios";
import { fixUrl } from "@helpers/fixUrl";
import { useAuth } from "@context/AuthContext";
function SearchResults({ onPlayTrack, setTracks, setCurrentTrack, setPlaylistName }) {
    const { accessToken, user } = useAuth();
    const location = useLocation();
    const query = new URLSearchParams(location.search).get("q")?.trim() || "";
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState({
        publicTracks: [],
        publicPlaylists: []
    });
    const abortRef = useRef(null);
    function normalize(str) {
        return str?.toLowerCase().replace(/\s+/g, " ").trim();
    }
    function matchesTrack(track, query) {
        const q = normalize(query);
        if (!q) return true;
        const title = normalize(track.title);
        const artist = normalize(track.artist);
        const parts = q.split(" ");
        return parts.every(part =>
            title.includes(part) ||
            artist.includes(part)
        );
    }
    function matchesPlaylist(playlist, query) {
        const q = normalize(query);
        if (!q) return true;
        const title = normalize(playlist.title);
        const desc = normalize(playlist.description || "");
        const parts = q.split(" ");
        return parts.every(part =>
            title.includes(part) ||
            desc.includes(part)
        );
    }
    useEffect(() => {
        setLoading(true);
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        const timeoutId = setTimeout(async () => {
            try {
                const [publicTracks, publicPlaylists] = await Promise.all([
                    api.get("/api/tracks", { signal: controller.signal }).then(r => r.data),
                    api.get("/api/playlists/public", { signal: controller.signal }).then(r => r.data)
                ]);
                const preparedTracks = (publicTracks || []).map(t => ({
                    ...t,
                    audioUrl: fixUrl(t.audioUrl),
                    coverUrl: fixUrl(t.coverUrl)
                }));
                const preparedPlaylists = (publicPlaylists || []).map(p => ({
                    ...p,
                    coverUrl: fixUrl(p.coverUrl)
                }));
                setResults({
                    publicTracks: preparedTracks.filter(t => matchesTrack(t, query)),
                    publicPlaylists: preparedPlaylists.filter(p => matchesPlaylist(p, query))
                });
            } catch (err) {
                if (err.name !== "CanceledError" && err.name !== "AbortError") {
                    console.error("Ошибка поиска:", err);
                }
            } finally {
                setLoading(false);
            }
        }, 150); 
        return () => {
            clearTimeout(timeoutId);
            controller.abort();
        };
    }, [query, accessToken, user]);
    const playPlaylist = async (playlist) => {
        try {
            const { data } = await api.get(`/api/playlists/public/${playlist.id}`);
            const prepared = (data.tracks || []).map((track) => ({
                ...track,
                audioUrl: fixUrl(track.audioUrl),
                coverUrl: fixUrl(track.coverUrl)
            }));
            setTracks(prepared);
            setPlaylistName(data.title || playlist.title);
            if (prepared.length > 0) {
                setCurrentTrack(prepared[0]);
            }
        } catch (err) {
            console.error("Ошибка открытия плейлиста:", err);
        }
    };
    const renderTrackRow = (title, items) => {
        if (!items?.length) return null;
        return (
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h3>{title}</h3>
                    <span>{items.length}</span>
                </div>
                <div className={styles.row}>
                    {items.map((track) => (
                        <div key={track.id} className={styles.card}>
                            <img
                                src={fixUrl(track.coverUrl) || "/default-cover.png"}
                                alt={track.title}
                                className={styles.cover}
                            />
                            <div className={styles.cardText}>
                                <div className={styles.cardTitle}>{track.title}</div>
                                <div className={styles.cardMeta}>{track.artist}</div>
                            </div>
                            <button
                                className={`button ${styles.cardButton}`}
                                onClick={() =>
                                    onPlayTrack({
                                        ...track,
                                        audioUrl: fixUrl(track.audioUrl),
                                        coverUrl: fixUrl(track.coverUrl)
                                    })
                                }
                            >
                                Играть
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        );
    };
    const renderPlaylistRow = (title, items) => {
        if (!items?.length) return null;
        return (
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h3>{title}</h3>
                    <span>{items.length}</span>
                </div>
                <div className={styles.row}>
                    {items.map((playlist) => (
                        <div key={playlist.id} className={styles.card}>
                            <img
                                src={fixUrl(playlist.coverUrl) || "/default-cover.png"}
                                alt={playlist.title}
                                className={styles.cover}
                            />
                            <div className={styles.cardText}>
                                <div className={styles.cardTitle}>{playlist.title}</div>
                                <div className={styles.cardMeta}>
                                    {playlist.description || "Плейлист без описания"}
                                </div>
                            </div>
                            <button
                                className={`button ${styles.cardButton}`}
                                onClick={() => playPlaylist(playlist)}
                            >
                                Открыть
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        );
    };
    const isEmpty =
        !results.publicTracks.length &&
        !results.publicPlaylists.length;
    return (
        <div className={styles.page}>
            <div className={styles.hero}>
                <p className={styles.kicker}>Поиск по библиотеке</p>
                <h2 className={styles.title}>Результаты по запросу: "{query}"</h2>
                <p className={styles.subtitle}>
                    Здесь собраны только публичные треки и плейлисты.
                </p>
            </div>
            {loading && <p className={styles.info}>Ищем подходящие варианты...</p>}
            {!loading && isEmpty && (
                <p className={styles.info}>По этому запросу ничего не найдено.</p>
            )}
            {!loading && (
                <>
                    {renderTrackRow("Публичные треки", results.publicTracks)}
                    {renderPlaylistRow("Публичные плейлисты", results.publicPlaylists)}
                </>
            )}
        </div>
    );
}
export default SearchResults;

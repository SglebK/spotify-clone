import React, { useEffect, useState } from "react";
import styles from "./SearchResults.module.css";
import { API_URL } from "../../components/utils/api/config";
import { fixUrl } from "../../components/utils/fixUrl/fixUrl";
import { useAuth } from "../../context/auth/AuthContext";

function SearchResults({ searchQuery, onPlayTrack, setTracks, setCurrentTrack, setPlaylistName }) {
    const { accessToken, user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState({
        publicTracks: [],
        myTracks: [],
        publicPlaylists: [],
        myPlaylists: []
    });

    useEffect(() => {
        const query = searchQuery?.trim();
        if (!query) return;

        let active = true;
        setLoading(true);

        const timeoutId = setTimeout(async () => {
            try {
                const requests = [
                    fetch(`${API_URL}/api/tracks?search=${encodeURIComponent(query)}`).then((res) => res.json()),
                    fetch(`${API_URL}/api/playlists/public?search=${encodeURIComponent(query)}`).then((res) => res.json())
                ];

                if (user && accessToken) {
                    requests.push(
                        fetch(`${API_URL}/api/tracks/my?search=${encodeURIComponent(query)}`, {
                            headers: { Authorization: `Bearer ${accessToken}` }
                        }).then((res) => res.json())
                    );
                    requests.push(
                        fetch(`${API_URL}/api/playlists/my?search=${encodeURIComponent(query)}`, {
                            headers: { Authorization: `Bearer ${accessToken}` }
                        }).then((res) => res.json())
                    );
                } else {
                    requests.push(Promise.resolve([]), Promise.resolve([]));
                }

                const [publicTracks, publicPlaylists, myTracks, myPlaylists] = await Promise.all(requests);

                if (!active) return;

                setResults({
                    publicTracks,
                    publicPlaylists,
                    myTracks,
                    myPlaylists
                });
            } catch (err) {
                console.error("Ошибка поиска:", err);
            } finally {
                if (active) setLoading(false);
            }
        }, 220);

        return () => {
            active = false;
            clearTimeout(timeoutId);
        };
    }, [searchQuery, accessToken, user]);

    const playPlaylist = async (playlist, isPublic) => {
        try {
            const url = isPublic
                ? `${API_URL}/api/playlists/public/${playlist.id}`
                : `${API_URL}/api/playlists/${playlist.id}`;

            const res = await fetch(url, {
                headers: !isPublic && accessToken
                    ? { Authorization: `Bearer ${accessToken}` }
                    : undefined
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Не удалось открыть плейлист");
            }

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

    const renderPlaylistRow = (title, items, isPublic) => {
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
                                onClick={() => playPlaylist(playlist, isPublic)}
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
        !results.myTracks.length &&
        !results.publicPlaylists.length &&
        !results.myPlaylists.length;

    return (
        <div className={styles.page}>
            <div className={styles.hero}>
                <p className={styles.kicker}>Поиск по библиотеке</p>
                <h2 className={styles.title}>Результаты по запросу: "{searchQuery}"</h2>
                <p className={styles.subtitle}>
                    Здесь собраны треки и плейлисты из общего каталога и ваших разделов.
                </p>
            </div>

            {loading && <p className={styles.info}>Ищем подходящие варианты...</p>}

            {!loading && isEmpty && (
                <p className={styles.info}>По этому запросу пока ничего не найдено.</p>
            )}

            {!loading && (
                <>
                    {renderTrackRow("Ваши треки", results.myTracks)}
                    {renderPlaylistRow("Ваши плейлисты", results.myPlaylists, false)}
                    {renderTrackRow("Все треки", results.publicTracks)}
                    {renderPlaylistRow("Публичные плейлисты", results.publicPlaylists, true)}
                </>
            )}
        </div>
    );
}

export default SearchResults;

// src/layout/4footer/footer42/Footer42.jsx

import React from 'react';
import styles from './Footer42.module.css';
import ProgressBar from "../../../components/progressBar/ProgressBar";

import { useFooter42Logic } from "./Footer42Function";

import featured_play_list1 from '../../../assets/icons/featured_play_list1.png';
import featured_play_list2 from '../../../assets/icons/featured_play_list2.png';
import play1 from '../../../assets/icons/play1.png';
import play2 from '../../../assets/icons/play2.png';
import t10_1 from '../../../assets/icons/t10_1.png';
import t10_2 from '../../../assets/icons/t10_2.png';
import t30_1 from '../../../assets/icons/t30_1.png';
import t30_2 from '../../../assets/icons/t30_2.png';

import repeat_off1 from '../../../assets/icons/repeat_off1.png';
import repeat_off2 from '../../../assets/icons/repeat_off2.png';
import repeat_playlist1 from '../../../assets/icons/repeat_playlist1.png';
import repeat_playlist2 from '../../../assets/icons/repeat_playlist2.png';
import repeat_one1 from '../../../assets/icons/repeat_one1.png';
import repeat_one2 from '../../../assets/icons/repeat_one2.png';

import skip_next1 from '../../../assets/icons/skip_next1.png';
import skip_next2 from '../../../assets/icons/skip_next2.png';
import pause1 from '../../../assets/icons/pause1.png';
import pause2 from '../../../assets/icons/pause2.png';

function Footer42({ theme, track, volume, onTogglePlaylist, onNextTrack, hasNextTrack }) {

    const {
        audioRef,
        speed,
        isPlaying,
        currentTime,
        duration,
        repeatMode,

        togglePlay,
        changeSpeed,
        rewind10,
        forward30,
        toggleRepeat,
        formatTime
    } = useFooter42Logic(track, volume, onNextTrack, hasNextTrack);

    const repeatIconFinal = {
        off: theme === "dark" ? repeat_off1 : repeat_off2,
        playlist: theme === "dark" ? repeat_playlist1 : repeat_playlist2,
        one: theme === "dark" ? repeat_one1 : repeat_one2
    }[repeatMode];

    const featured_play_listIcon = theme === 'dark' ? featured_play_list1 : featured_play_list2;
    const playIcon = theme === 'dark' ? play1 : play2;
    const t10_Icon = theme === 'dark' ? t10_1 : t10_2;
    const t30_Icon = theme === 'dark' ? t30_1 : t30_2;
    const skip_nextIcon = theme === 'dark' ? skip_next1 : skip_next2;
    const pauseIcon = theme === 'dark' ? pause1 : pause2;

    return (
        <div className={styles.player}>

            {/* ⭐ ВАЖНО: src НЕ указываем здесь! */}
            {/* useFooter42Logic сам обновляет audioRef.current.src */}
            <audio ref={audioRef} />

            <div className={styles.controls}>

                <button className={styles.playBtn} onClick={onTogglePlaylist}>
                    <img src={featured_play_listIcon} className={styles.iconS} />
                </button>

                <button
                    className={`${styles.smallBtn} ${styles.speedBtn} ${theme}`}
                    onClick={changeSpeed}
                >
                    {speed}x
                </button>

                <button className={styles.playBtn} onClick={rewind10}>
                    <img src={t10_Icon} className={styles.iconS} />
                </button>

                <button className={styles.playBtn} onClick={togglePlay}>
                    <img
                        src={isPlaying ? pauseIcon : playIcon}
                        className={styles.icon}
                    />
                </button>

                <button className={styles.playBtn} onClick={forward30}>
                    <img src={t30_Icon} className={styles.iconS} />
                </button>

                <button className={styles.playBtn} onClick={toggleRepeat}>
                    <img src={repeatIconFinal} className={styles.iconS} />
                </button>

                <button className={styles.playBtn} onClick={onNextTrack}>
                    <img src={skip_nextIcon} className={styles.iconS} />
                </button>

            </div>

            <div className={styles.progress}>
                <span className={styles.time}>{formatTime(currentTime)}</span>

                <ProgressBar audioRef={audioRef} />

                <span className={styles.time}>{formatTime(duration - currentTime)}</span>
            </div>

        </div>
    );
}

export default Footer42;

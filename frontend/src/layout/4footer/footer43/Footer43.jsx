// src/layout/4footer/footer43/Footer43.jsx

import React, { useState, useEffect } from 'react';
import styles from './Footer43.module.css';

function Footer43({ volume, setVolume }) {

    const [prevVolume, setPrevVolume] = useState(volume);

    // ⭐ Если громкость изменилась извне — обновляем prevVolume корректно
    useEffect(() => {
        if (volume > 0) {
            setPrevVolume(volume);
        }
    }, [volume]);

    const getIcon = () => {
        if (volume === 0) return "🔇";
        if (volume < 0.3) return "🔈";
        if (volume < 0.7) return "🔉";
        return "🔊";
    };

    const handleChange = (e) => {
        const v = Number(e.target.value) / 100;
        setVolume(v);
    };

    const toggleMute = () => {
        if (volume === 0) {
            setVolume(prevVolume || 0.5);
        } else {
            setPrevVolume(volume);
            setVolume(0);
        }
    };

    return (
        <div className={styles.right}>
            <span className={styles.icon} onClick={toggleMute}>
                {getIcon()}
            </span>

            <input
                type="range"
                min="0"
                max="100"
                value={volume * 100}
                onChange={handleChange}
                className={styles.slider}
            />
        </div>
    );
}

export default Footer43;

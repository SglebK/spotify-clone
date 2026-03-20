// src/layout/4footer/footer43/Footer43.jsx

import React, { useState, useEffect } from 'react';
import styles from './Footer43.module.css';
import volumeOff1 from '../../../assets/icons/volume_off1.png';
import volumeOff2 from '../../../assets/icons/volume_off2.png';
import volumeUp1 from '../../../assets/icons/volume_up1.png';
import volumeUp2 from '../../../assets/icons/volume_up2.png';

function Footer43({ theme, volume, setVolume }) {

    const [prevVolume, setPrevVolume] = useState(volume);

    // ⭐ Если громкость изменилась извне — обновляем prevVolume корректно
    useEffect(() => {
        if (volume > 0) {
            setPrevVolume(volume);
        }
    }, [volume]);

    const iconSrc = volume === 0
        ? (theme === "dark" ? volumeOff1 : volumeOff2)
        : (theme === "dark" ? volumeUp1 : volumeUp2);

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
            <button type="button" className={styles.iconButton} onClick={toggleMute}>
                <img src={iconSrc} alt="volume" className={styles.icon} />
            </button>

            <input
                type="range"
                min="0"
                max="100"
                value={volume * 100}
                onChange={handleChange}
                className={styles.slider}
                style={{
                    background: `linear-gradient(to right, var(--progress-bg) 0%, var(--progress-bg) ${volume * 100}%, var(--progress-fill) ${volume * 100}%, var(--progress-fill) 100%)`
                }}
            />
        </div>
    );
}

export default Footer43;

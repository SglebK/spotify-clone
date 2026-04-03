import React, { useState, useRef, useEffect } from "react";
import styles from "./TrimAudio.module.css";
function TrimAudio({ onPlayTrack, setTracks, volume = 1 }) {
  const [file, setFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [durationSec, setDurationSec] = useState(0);
  const [startMin, setStartMin] = useState("00");
  const [startSec, setStartSec] = useState("00");
  const [endMin, setEndMin] = useState("00");
  const [endSec, setEndSec] = useState("00");
  const [fragmentProgress, setFragmentProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const fragmentAudioRef = useRef(null);
  const toSeconds = (m, s) => Number(m) * 60 + Number(s);
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      onPlayTrack(null);
      setTracks([]);
    };
  }, []);
  useEffect(() => {
    if (fragmentAudioRef.current) {
      fragmentAudioRef.current.volume = volume;
    }
  }, [volume]);
  useEffect(() => {
    if (fragmentAudioRef.current) {
      fragmentAudioRef.current.volume = volume;
    }
  }, [audioUrl]);
  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    if (fragmentAudioRef.current) {
      fragmentAudioRef.current.pause();
      fragmentAudioRef.current.currentTime = 0;
    }

    setFile(f);
    const url = URL.createObjectURL(f);
    setAudioUrl(url);
    setFragmentProgress(0);
    setIsPlaying(false);

    const audio = new Audio(url);
    audio.onloadedmetadata = () => {
      const dur = audio.duration;
      setDurationSec(dur);
      const m = Math.floor(dur / 60).toString().padStart(2, "0");
      const s = Math.floor(dur % 60).toString().padStart(2, "0");
      setStartMin("00");
      setStartSec("00");
      setEndMin(m);
      setEndSec(s);
    };
  };
  const downloadWav = async () => {
    if (!file) return;
    const start = toSeconds(startMin, startSec);
    const end = toSeconds(endMin, endSec);
    const arrayBuffer = await file.arrayBuffer();
    const audioCtx = new AudioContext();
    const decoded = await audioCtx.decodeAudioData(arrayBuffer);
    const sampleRate = decoded.sampleRate;
    const startSample = Math.floor(start * sampleRate);
    const endSample = Math.floor(end * sampleRate);
    const length = endSample - startSample;
    const fragmentBuffer = audioCtx.createBuffer(
      decoded.numberOfChannels,
      length,
      sampleRate
    );
    for (let ch = 0; ch < decoded.numberOfChannels; ch++) {
      const channelData = decoded.getChannelData(ch).slice(startSample, endSample);
      fragmentBuffer.copyToChannel(channelData, ch);
    }
    const wavBlob = bufferToWav(fragmentBuffer);
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fragment.wav";
    a.click();
    URL.revokeObjectURL(url);
  };
  const bufferToWav = (buffer) => {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const bitDepth = 16;
    let result;
    if (numChannels === 2) {
      result = interleave(buffer.getChannelData(0), buffer.getChannelData(1));
    } else {
      result = buffer.getChannelData(0);
    }
    const wavBuffer = encodeWAV(result, numChannels, sampleRate, bitDepth);
    return new Blob([wavBuffer], { type: "audio/wav" });
  };
  const interleave = (left, right) => {
    const length = left.length + right.length;
    const result = new Float32Array(length);
    let index = 0;
    for (let i = 0; i < left.length; i++) {
      result[index++] = left[i];
      result[index++] = right[i];
    }
    return result;
  };
  const encodeWAV = (samples, numChannels, sampleRate, bitDepth) => {
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const buffer = new ArrayBuffer(44 + samples.length * bytesPerSample);
    const view = new DataView(buffer);
    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + samples.length * bytesPerSample, true);
    writeString(view, 8, "WAVE");
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, "data");
    view.setUint32(40, samples.length * bytesPerSample, true);
    floatTo16BitPCM(view, 44, samples);
    return buffer;
  };
  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  const floatTo16BitPCM = (view, offset, samples) => {
    for (let i = 0; i < samples.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
  };
  const playFragment = () => {
    if (!fragmentAudioRef.current) return;
    const start = toSeconds(startMin, startSec);
    const end = toSeconds(endMin, endSec);
    fragmentAudioRef.current.currentTime = start;
    fragmentAudioRef.current.volume = volume;
    fragmentAudioRef.current.play();
    setIsPlaying(true);
    const interval = setInterval(() => {
      const current = fragmentAudioRef.current.currentTime;
      if (current >= end) {
        fragmentAudioRef.current.pause();
        fragmentAudioRef.current.currentTime = start;
        setIsPlaying(false);
        clearInterval(interval);
      }
      setFragmentProgress(current);
    }, 100);
    fragmentAudioRef.current.onpause = () => {
      setIsPlaying(false);
      clearInterval(interval);
    };
  };
  const togglePlay = () => {
    if (!fragmentAudioRef.current) return;

    if (isPlaying) {
      fragmentAudioRef.current.pause();
      setIsPlaying(false);
    } else {
      playFragment();
    }
  };
  const handleSeek = (value) => {
    const sec = Number(value);
    setFragmentProgress(sec);
    fragmentAudioRef.current.currentTime = sec;
  };
  const start = toSeconds(startMin, startSec);
  const end = toSeconds(endMin, endSec);
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Обрезка аудио</h1>
      <div className={styles.fileWrapper}>
        <input
          type="file"
          accept="audio/*"
          id="fileInput"
          className={styles.hiddenInput}
          onChange={handleFile}
        />
        <label htmlFor="fileInput" className={styles.fileButton}>
          🎵 Выбрать аудиофайл
        </label>
      </div>
      {audioUrl && (
        <>
          <audio ref={fragmentAudioRef} src={audioUrl} />
          <div className={styles.info}>
            <p>Длительность: {formatTime(durationSec)}</p>
          </div>
          <div className={styles.timeRow}>
            <label>Начало:</label>
            <input
              type="text"
              maxLength={2}
              value={startMin}
              onChange={(e) => setStartMin(e.target.value.replace(/\D/g, ""))}
            />
            <span>:</span>
            <input
              type="text"
              maxLength={2}
              value={startSec}
              onChange={(e) => setStartSec(e.target.value.replace(/\D/g, ""))}
            />
          </div>
          <div className={styles.timeRow}>
            <label>Конец:</label>
            <input
              type="text"
              maxLength={2}
              value={endMin}
              onChange={(e) => setEndMin(e.target.value.replace(/\D/g, ""))}
            />
            <span>:</span>
            <input
              type="text"
              maxLength={2}
              value={endSec}
              onChange={(e) => setEndSec(e.target.value.replace(/\D/g, ""))}
            />
          </div>
          <div className={styles.progressContainer}>
            <span>{formatTime(fragmentProgress)}</span>
            <input
              type="range"
              min={start}
              max={end}
              value={fragmentProgress}
              onChange={(e) => handleSeek(e.target.value)}
            />
            <span>{formatTime(end)}</span>
          </div>
          <button className={styles.playFragment} onClick={togglePlay}>
            {isPlaying ? "⏸ Пауза" : "▶ Воспроизвести фрагмент"}
          </button>
          <button
            className={styles.saveButton}
            onClick={downloadWav}
            disabled={!file}
          >
            Скачать фрагмент
          </button>
        </>
      )}
    </div>
  );
}
export default TrimAudio;

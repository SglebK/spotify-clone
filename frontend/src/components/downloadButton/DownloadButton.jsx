import React from "react";
import { fixUrl } from "@helpers/fixUrl";
import { useError } from "@context/ErrorContext.jsx";
function DownloadButton({ track, className }) {
    const { showError } = useError();
    const handleDownload = async () => {
        try {
            const url = fixUrl(track.audioUrl);
            const response = await fetch(url);
            if (!response.ok) throw new Error("Файл недоступен");
            const blob = await response.blob();
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `${track.title}.mp3`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch (err) {
            console.error("Ошибка скачивания:", err);
            showError("Не удалось скачать трек");
        }
    };
    return (
        <button className={className} onClick={handleDownload}>
            Скачать
        </button>
    );
}
export default DownloadButton;

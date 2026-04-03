import React from "react";
function DownloadFragmentButton({ blob, filename = "fragment.mp3", className }) {
    if (!blob) return null;
    const handleDownload = () => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    };
    return (
        <button className={className} onClick={handleDownload}>
            Скачать фрагмент
        </button>
    );
}
export default DownloadFragmentButton;

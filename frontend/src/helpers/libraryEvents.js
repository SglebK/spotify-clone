export function emitLibraryChanged(kind = "generic") {
    window.dispatchEvent(new CustomEvent("library:changed", {
        detail: { kind, timestamp: Date.now() }
    }));
}
export function subscribeLibraryChanged(callback) {
    const handler = (e) => callback(e.detail);
    window.addEventListener("library:changed", handler);
    return () => window.removeEventListener("library:changed", handler);
}
export const libraryEvents = {
    emit(kind = "generic") {
        emitLibraryChanged(kind);
    },
    on(kind, callback) {
        const handler = (e) => {
            if (e.detail.kind === kind) callback(e.detail);
        };
        window.addEventListener("library:changed", handler);
        return () => window.removeEventListener("library:changed", handler);
    },
    off(kind, callback) {
        console.warn("libraryEvents.off: используйте функцию, возвращённую из .on()");
    }
};

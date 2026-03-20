export function emitLibraryChanged(kind = "generic") {
    window.dispatchEvent(new CustomEvent("library:changed", {
        detail: { kind, timestamp: Date.now() }
    }));
}

"use client";

import { useEffect } from "react";

const RELOAD_KEY = "banana-mall-chunk-reload-once";

function shouldReloadForChunkError(message: string) {
  return /chunkloaderror|loading chunk [\w-]+ failed|failed to fetch dynamically imported module/i.test(message);
}

export function ChunkReloadGuard() {
  useEffect(() => {
    const reloadOnce = () => {
      try {
        const alreadyReloaded = window.sessionStorage.getItem(RELOAD_KEY);
        if (alreadyReloaded === "1") {
          window.sessionStorage.removeItem(RELOAD_KEY);
          return;
        }
        window.sessionStorage.setItem(RELOAD_KEY, "1");
      } catch {
        return;
      }

      window.location.reload();
    };

    const handleError = (event: ErrorEvent) => {
      const message = event.message ?? event.error?.message ?? "";
      if (shouldReloadForChunkError(message)) {
        reloadOnce();
      }
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason =
        typeof event.reason === "string"
          ? event.reason
          : event.reason instanceof Error
            ? event.reason.message
            : "";

      if (shouldReloadForChunkError(reason)) {
        reloadOnce();
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return null;
}

import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import App from "./App.tsx";
import "./index.css";

const CHUNK_ERROR_PATTERNS = [
  /Failed to fetch dynamically imported module/i,
  /Importing a module script failed/i,
  /Loading chunk [\w-]+ failed/i,
  /ChunkLoadError/i,
  /error loading dynamically imported module/i,
  /dynamically imported module/i,
  /Unable to preload CSS/i,
];

const CHUNK_RELOAD_KEY = "__vurp_chunk_reload_state__";
const MAX_RELOADS_PER_PATH = 2;
const CHUNK_RELOAD_WINDOW_MS = 30_000;
const GLOBAL_RESET_VERSION = "2026-03-26-login-cache-reset-2";
const GLOBAL_RESET_KEY = "__vurp_global_reset_version__";

const getErrorMessage = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "message" in value) {
    const message = (value as { message?: unknown }).message;
    return typeof message === "string" ? message : "";
  }
  return "";
};

const shouldReloadForChunkError = (message: string) =>
  CHUNK_ERROR_PATTERNS.some((pattern) => pattern.test(message));

type ChunkReloadState = {
  path: string;
  attempts: number;
  lastAttemptAt: number;
};

const getChunkReloadState = (): ChunkReloadState | null => {
  try {
    const raw = sessionStorage.getItem(CHUNK_RELOAD_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ChunkReloadState;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
};

const setChunkReloadState = (state: ChunkReloadState) => {
  try {
    sessionStorage.setItem(CHUNK_RELOAD_KEY, JSON.stringify(state));
  } catch {
    // no-op
  }
};

const clearChunkReloadState = () => {
  try {
    sessionStorage.removeItem(CHUNK_RELOAD_KEY);
  } catch {
    // no-op
  }
};

const applyGlobalResetIfNeeded = () => {
  try {
    const alreadyApplied = localStorage.getItem(GLOBAL_RESET_KEY) === GLOBAL_RESET_VERSION;
    if (alreadyApplied) return;

    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(GLOBAL_RESET_KEY, GLOBAL_RESET_VERSION);
  } catch {
    // no-op
  }

  if ("caches" in window) {
    caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))).catch(() => {
      // no-op
    });
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        void registration.unregister();
      });
    }).catch(() => {
      // no-op
    });
  }
};

const reloadOnceForChunkError = () => {
  const now = Date.now();
  const currentPath = window.location.pathname;
  const previousState = getChunkReloadState();

  const isSamePathWithinWindow =
    previousState &&
    previousState.path === currentPath &&
    now - previousState.lastAttemptAt < CHUNK_RELOAD_WINDOW_MS;

  const nextAttempts = isSamePathWithinWindow ? previousState.attempts + 1 : 1;
  if (nextAttempts > MAX_RELOADS_PER_PATH) return;

  setChunkReloadState({
    path: currentPath,
    attempts: nextAttempts,
    lastAttemptAt: now,
  });

  window.location.reload();
};

// If the app stays up for a few seconds, clear the guard so future deploys can auto-recover.
setTimeout(() => {
  clearChunkReloadState();
}, 10_000);

window.addEventListener("error", (event) => {
  const message = event.message || getErrorMessage(event.error);
  if (shouldReloadForChunkError(message)) {
    reloadOnceForChunkError();
  }
});

window.addEventListener("unhandledrejection", (event) => {
  const message = getErrorMessage(event.reason);
  if (shouldReloadForChunkError(message)) {
    reloadOnceForChunkError();
  }
});

applyGlobalResetIfNeeded();

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
    <Analytics />
    <SpeedInsights />
  </HelmetProvider>
);

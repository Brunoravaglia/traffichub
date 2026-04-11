import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import DeferredMonitoring from "./components/DeferredMonitoring";
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
const GLOBAL_RESET_VERSION = "2026-03-30-client-recovery-1";
const GLOBAL_RESET_KEY = "__vurp_global_reset_version__";
const SUPABASE_AUTH_SEARCH_KEYS = ["code", "error", "error_code", "error_description"];
const SUPABASE_AUTH_HASH_KEYS = [
  "access_token",
  "refresh_token",
  "expires_in",
  "token_type",
  "type",
  "error",
  "error_code",
  "error_description",
];

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

const hasAnyUrlParam = (params: URLSearchParams, keys: string[]) =>
  keys.some((key) => params.has(key));

const isSupabaseAuthCallback = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  const hashParams = new URLSearchParams(hash);

  return (
    hasAnyUrlParam(searchParams, SUPABASE_AUTH_SEARCH_KEYS) ||
    hasAnyUrlParam(hashParams, SUPABASE_AUTH_HASH_KEYS)
  );
};

const hardResetForChunkError = () => {
  try {
    if (isSupabaseAuthCallback()) {
      localStorage.setItem(GLOBAL_RESET_KEY, GLOBAL_RESET_VERSION);
      window.location.reload();
      return;
    }

    const theme = localStorage.getItem("vurp-theme");

    localStorage.clear();
    sessionStorage.clear();
    if (theme) {
      localStorage.setItem("vurp-theme", theme);
    }
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

  window.location.reload();
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

  if (nextAttempts >= MAX_RELOADS_PER_PATH) {
    hardResetForChunkError();
    return;
  }

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

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
    <DeferredMonitoring />
  </HelmetProvider>
);

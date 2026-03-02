import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

const CHUNK_ERROR_PATTERNS = [
  /Failed to fetch dynamically imported module/i,
  /Importing a module script failed/i,
  /Loading chunk [\w-]+ failed/i,
  /ChunkLoadError/i,
];

const CHUNK_RELOAD_KEY = "__vurp_chunk_reload_attempted__";

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

const reloadOnceForChunkError = () => {
  if (sessionStorage.getItem(CHUNK_RELOAD_KEY) === "1") return;
  sessionStorage.setItem(CHUNK_RELOAD_KEY, "1");
  window.location.reload();
};

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
    </HelmetProvider>
);

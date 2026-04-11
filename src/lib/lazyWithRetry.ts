import { lazy, type ComponentType } from "react";

const CHUNK_IMPORT_ERROR_PATTERNS = [
  /Failed to fetch dynamically imported module/i,
  /Importing a module script failed/i,
  /Loading chunk [\w-]+ failed/i,
  /ChunkLoadError/i,
  /error loading dynamically imported module/i,
  /dynamically imported module/i,
  /Unable to preload CSS/i,
];

const LAZY_RETRY_KEY = "__vurp_lazy_retry__";

const getImportErrorMessage = (error: unknown) => {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    return typeof message === "string" ? message : "";
  }
  return "";
};

const isChunkImportError = (error: unknown) => {
  const message = getImportErrorMessage(error);
  return CHUNK_IMPORT_ERROR_PATTERNS.some((pattern) => pattern.test(message));
};

export const lazyWithRetry = <T extends ComponentType>(
  factory: () => Promise<{ default: T }>
) =>
  lazy(async () => {
    try {
      return await factory();
    } catch (error) {
      if (typeof window !== "undefined" && isChunkImportError(error)) {
        const key = `${LAZY_RETRY_KEY}:${window.location.pathname}`;
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, "1");
          window.location.reload();
          return new Promise(() => {}) as Promise<{ default: T }>;
        }
        sessionStorage.removeItem(key);
      }

      throw error;
    }
  });

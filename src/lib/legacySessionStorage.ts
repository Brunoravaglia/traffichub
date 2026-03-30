const isBrowser = () => typeof window !== "undefined";

const getSessionStorage = () => (isBrowser() ? window.sessionStorage : null);
const getLocalStorage = () => (isBrowser() ? window.localStorage : null);

export const LEGACY_AUTH_STORAGE_KEYS = [
  "vcd_gestor_id",
  "vcd_session_id",
  "vcd_session_start",
  "vcd_gestor_profile",
  "vurp_agency_profile",
  "vurp_agency_slug",
] as const;

export type LegacyAuthStorageKey = (typeof LEGACY_AUTH_STORAGE_KEYS)[number];

export const readLegacyAuthValue = (key: LegacyAuthStorageKey): string | null => {
  const sessionValue = getSessionStorage()?.getItem(key);
  if (sessionValue) {
    return sessionValue;
  }

  return getLocalStorage()?.getItem(key) ?? null;
};

export const readLegacyAuthJson = <T,>(key: LegacyAuthStorageKey): T | null => {
  const raw = readLegacyAuthValue(key);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export const writeLegacyAuthValue = (key: LegacyAuthStorageKey, value: string) => {
  getSessionStorage()?.setItem(key, value);
  getLocalStorage()?.setItem(key, value);
};

export const writeLegacyAuthJson = (key: LegacyAuthStorageKey, value: unknown) => {
  writeLegacyAuthValue(key, JSON.stringify(value));
};

export const removeLegacyAuthValue = (key: LegacyAuthStorageKey) => {
  getSessionStorage()?.removeItem(key);
  getLocalStorage()?.removeItem(key);
};

export const clearLegacyAuthStorage = () => {
  LEGACY_AUTH_STORAGE_KEYS.forEach(removeLegacyAuthValue);
};

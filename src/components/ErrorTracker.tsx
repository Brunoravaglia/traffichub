import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useGestor } from "@/contexts/GestorContext";

type TrackErrorInput = {
  message: string;
  stack?: string | null;
  errorType?: string;
  metadata?: Record<string, unknown>;
};

const DEDUPE_WINDOW_MS = 8000;

const sanitize = (value: string | null | undefined, max = 1200) => {
  if (!value) return null;
  return value.substring(0, max);
};

const ErrorTracker = () => {
  const location = useLocation();
  const { gestor } = useGestor();
  const lastSentRef = useRef<Map<string, number>>(new Map());

  const trackError = async ({ message, stack, errorType = "runtime", metadata = {} }: TrackErrorInput) => {
    if (!gestor?.id || !gestor.agencia_id || !message) return;

    const fingerprint = `${errorType}|${location.pathname}|${message}`;
    const now = Date.now();
    const last = lastSentRef.current.get(fingerprint) ?? 0;
    if (now - last < DEDUPE_WINDOW_MS) return;
    lastSentRef.current.set(fingerprint, now);

    const payload = {
      agencia_id: gestor.agencia_id,
      gestor_id: gestor.id,
      route: location.pathname,
      error_type: errorType,
      source: "frontend",
      message: sanitize(message, 600) ?? "Erro sem mensagem",
      stack: sanitize(stack, 4000),
      user_agent: typeof navigator !== "undefined" ? sanitize(navigator.userAgent, 500) : null,
      metadata,
    };

    try {
      await supabase.from("app_errors").insert(payload);
    } catch {
      // Silent fail: telemetry cannot break UX.
    }
  };

  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      const fallbackStack = event.filename
        ? `${event.filename}:${event.lineno}:${event.colno}`
        : null;

      void trackError({
        message: event.message || "window.error",
        stack: event.error?.stack || fallbackStack,
        errorType: "window.error",
      });
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason =
        typeof event.reason === "string"
          ? event.reason
          : event.reason?.message || JSON.stringify(event.reason ?? "unknown rejection");

      const stack =
        typeof event.reason === "object" && event.reason?.stack
          ? String(event.reason.stack)
          : null;

      void trackError({
        message: `Unhandled rejection: ${reason}`,
        stack,
        errorType: "unhandledrejection",
      });
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, [location.pathname, gestor?.agencia_id, gestor?.id]);

  return null;
};

export default ErrorTracker;

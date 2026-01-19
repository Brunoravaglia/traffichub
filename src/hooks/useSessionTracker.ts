import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const SAVE_INTERVAL = 30000; // Save every 30 seconds

interface UseSessionTrackerProps {
  sessionId: string | null;
  sessionStartTime: Date | null;
  isLoggedIn: boolean;
}

/**
 * Hook that automatically saves session duration every 30 seconds
 * and on page unload to prevent data loss
 */
export const useSessionTracker = ({
  sessionId,
  sessionStartTime,
  isLoggedIn,
}: UseSessionTrackerProps) => {
  const lastSavedRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const saveSessionDuration = useCallback(async (isLogout = false) => {
    if (!sessionId || !sessionStartTime) return;

    const now = new Date();
    const durationSeconds = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000);

    // Don't save if duration hasn't changed significantly (at least 5 seconds difference)
    if (!isLogout && Math.abs(durationSeconds - lastSavedRef.current) < 5) {
      return;
    }

    lastSavedRef.current = durationSeconds;

    try {
      const updateData: Record<string, unknown> = {
        duration_seconds: durationSeconds,
      };

      // Only set logout_at if this is an actual logout
      if (isLogout) {
        updateData.logout_at = now.toISOString();
      }

      await supabase
        .from("gestor_sessions")
        .update(updateData)
        .eq("id", sessionId);
    } catch (error) {
      console.error("Error saving session duration:", error);
    }
  }, [sessionId, sessionStartTime]);

  // Set up interval to save duration periodically
  useEffect(() => {
    if (!isLoggedIn || !sessionId || !sessionStartTime) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Save immediately on mount
    saveSessionDuration();

    // Set up periodic saving
    intervalRef.current = setInterval(() => {
      saveSessionDuration();
    }, SAVE_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isLoggedIn, sessionId, sessionStartTime, saveSessionDuration]);

  // Save on page visibility change (tab hidden/visible)
  useEffect(() => {
    if (!isLoggedIn || !sessionId) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // User is leaving the tab, save immediately
        saveSessionDuration();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isLoggedIn, sessionId, saveSessionDuration]);

  // Save on page unload (closing tab/browser)
  useEffect(() => {
    if (!isLoggedIn || !sessionId || !sessionStartTime) return;

    const handleBeforeUnload = () => {
      const now = new Date();
      const durationSeconds = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000);

      // Use sendBeacon for reliable data sending on page close
      const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/gestor_sessions?id=eq.${sessionId}`;
      const data = JSON.stringify({
        duration_seconds: durationSeconds,
      });

      navigator.sendBeacon(url, new Blob([data], { type: "application/json" }));
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isLoggedIn, sessionId, sessionStartTime]);

  return { saveSessionDuration };
};

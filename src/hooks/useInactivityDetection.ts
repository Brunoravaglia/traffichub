import { useState, useEffect, useCallback, useRef } from "react";

const INACTIVITY_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes of inactivity

export const useInactivityDetection = (enabled: boolean) => {
  const [isInactive, setIsInactive] = useState(false);
  const lastActivityRef = useRef(Date.now());
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (isInactive) {
      setIsInactive(false);
    }
  }, [isInactive]);

  useEffect(() => {
    if (!enabled) {
      setIsInactive(false);
      return;
    }

    // Activity events to track
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"];

    const handleActivity = () => {
      lastActivityRef.current = Date.now();
      if (isInactive) {
        setIsInactive(false);
      }
    };

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Check for inactivity every 10 seconds
    checkIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= INACTIVITY_THRESHOLD_MS && !isInactive) {
        setIsInactive(true);
      }
    }, 10000);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [enabled, isInactive]);

  return {
    isInactive,
    resetActivity,
    lastActivity: lastActivityRef.current,
  };
};

export { INACTIVITY_THRESHOLD_MS };

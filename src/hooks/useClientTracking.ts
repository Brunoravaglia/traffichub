import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useGestor } from "@/contexts/GestorContext";

export const useClientTracking = (clienteId: string | null) => {
  const { gestor, sessionId } = useGestor();
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [clientDuration, setClientDuration] = useState(0);
  const startTimeRef = useRef<Date | null>(null);

  const startTracking = useCallback(async () => {
    if (!gestor || !sessionId || !clienteId) return;

    const { data, error } = await supabase
      .from("client_time_tracking")
      .insert({
        gestor_id: gestor.id,
        cliente_id: clienteId,
        session_id: sessionId,
      })
      .select()
      .single();

    if (!error && data) {
      setTrackingId(data.id);
      startTimeRef.current = new Date();
      setClientDuration(0);
    }
  }, [gestor, sessionId, clienteId]);

  const stopTracking = useCallback(async () => {
    if (!trackingId || !startTimeRef.current) return;

    const now = new Date();
    const durationSeconds = Math.floor((now.getTime() - startTimeRef.current.getTime()) / 1000);

    await supabase
      .from("client_time_tracking")
      .update({
        closed_at: now.toISOString(),
        duration_seconds: durationSeconds,
      })
      .eq("id", trackingId);

    setTrackingId(null);
    startTimeRef.current = null;
    setClientDuration(0);
  }, [trackingId]);

  // Update duration every second while tracking
  useEffect(() => {
    if (!startTimeRef.current) return;

    const interval = setInterval(() => {
      if (startTimeRef.current) {
        const now = new Date();
        const diff = Math.floor((now.getTime() - startTimeRef.current.getTime()) / 1000);
        setClientDuration(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [trackingId]);

  // Auto start when clienteId changes
  useEffect(() => {
    if (clienteId) {
      startTracking();
    }

    return () => {
      if (trackingId) {
        stopTracking();
      }
    };
  }, [clienteId]);

  return {
    clientDuration,
    isTracking: !!trackingId,
    startTracking,
    stopTracking,
  };
};

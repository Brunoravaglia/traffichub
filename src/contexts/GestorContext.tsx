import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

const SAVE_INTERVAL = 30000; // Save every 30 seconds

interface Agencia {
  id: string;
  nome: string;
  slug: string;
  logo_url: string | null;
  logo_black_url: string | null;
  cor_primaria: string | null;
  cor_secundaria: string | null;
}

interface Gestor {
  id: string;
  nome: string;
  foto_url: string | null;
  telefone: string | null;
  onboarding_completo: boolean;
  foto_preenchida: boolean;
  dados_completos: boolean;
  first_login_at: string | null;
  welcome_modal_dismissed: boolean | null;
  agencia_id: string | null;
  is_admin: boolean;
}

interface GestorContextType {
  gestor: Gestor | null;
  agencia: Agencia | null;
  sessionId: string | null;
  sessionStartTime: Date | null;
  sessionDuration: number;
  isLoggedIn: boolean;
  isFirstLogin: boolean;
  login: (gestorId: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  refreshGestor: () => Promise<void>;
  markWelcomeSeen: () => Promise<void>;
  setAgenciaBySlug: (slug: string) => Promise<{ success: boolean; agency?: Agencia; error?: string }>;
}

const GestorContext = createContext<GestorContextType | undefined>(undefined);

export const useGestor = () => {
  const context = useContext(GestorContext);
  if (!context) {
    throw new Error("useGestor must be used within a GestorProvider");
  }
  return context;
};

export const GestorProvider = ({ children }: { children: ReactNode }) => {
  const [gestor, setGestor] = useState<Gestor | null>(null);
  const [agencia, setAgencia] = useState<Agencia | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const lastSavedDurationRef = useRef<number>(0);
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const oauthSyncInProgressRef = useRef(false);

  // Function to save session duration to database
  const saveSessionDuration = useCallback(async (isLogout = false) => {
    const currentSessionId = sessionStorage.getItem("vcd_session_id");
    const currentSessionStart = sessionStorage.getItem("vcd_session_start");

    if (!currentSessionId || !currentSessionStart) return;

    const startTime = new Date(currentSessionStart);
    const now = new Date();
    const durationSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);

    // Don't save if duration hasn't changed significantly (at least 10 seconds difference)
    if (!isLogout && Math.abs(durationSeconds - lastSavedDurationRef.current) < 10) {
      return;
    }

    lastSavedDurationRef.current = durationSeconds;

    try {
      const updateData: Record<string, unknown> = {
        duration_seconds: durationSeconds,
      };

      if (isLogout) {
        updateData.logout_at = now.toISOString();
      }

      await supabase
        .from("gestor_sessions")
        .update(updateData)
        .eq("id", currentSessionId);

      console.log(`[Session] Saved duration: ${durationSeconds}s (logout: ${isLogout})`);
    } catch (error) {
      console.error("[Session] Error saving duration:", error);
    }
  }, []);

  // Load from sessionStorage on mount
  useEffect(() => {
    const storedGestorId = sessionStorage.getItem("vcd_gestor_id");
    const storedSessionId = sessionStorage.getItem("vcd_session_id");
    const storedSessionStart = sessionStorage.getItem("vcd_session_start");

    if (storedGestorId && storedSessionId && storedSessionStart) {
      setSessionId(storedSessionId);
      setSessionStartTime(new Date(storedSessionStart));

      // Fetch gestor data
      supabase
        .from("gestores")
        .select(
          "id, nome, foto_url, telefone, onboarding_completo, foto_preenchida, dados_completos, first_login_at, welcome_modal_dismissed, agencia_id"
        )
        .eq("id", storedGestorId)
        .single()
        .then((result) => {
          const { data } = result as { data: Gestor | null };
          if (data) {
            // @ts-ignore - Handle missing is_admin
            setGestor({ ...data, is_admin: false });
            setIsFirstLogin(!data.first_login_at);

            // If gestor has agency, fetch agency data
            if (data.agencia_id) {
              supabase
                .from("agencias")
                .select("*")
                .eq("id", data.agencia_id)
                .single()
                .then(({ data: agencyData }) => {
                  if (agencyData) setAgencia(agencyData as unknown as Agencia);
                });
            }
          }
        });
    }

    // Auto-detect agency from subdomain
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'vurp') {
      const slug = parts[0];
      supabase
        .from("agencias")
        .select("*")
        .eq("slug", slug)
        .single()
        .then(({ data }) => {
          if (data) setAgencia(data as unknown as Agencia);
        });
    } else {
      // Check if agency was manually selected and stored
      const storedAgencySlug = sessionStorage.getItem("vurp_agency_slug");
      if (storedAgencySlug) {
        supabase
          .from("agencias")
          .select("*")
          .eq("slug", storedAgencySlug)
          .single()
          .then(({ data }) => {
            if (data) setAgencia(data as unknown as Agencia);
          });
      }
    }

    const syncSupabaseOAuthSession = async (sessionUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }) => {
      if (oauthSyncInProgressRef.current) return;
      oauthSyncInProgressRef.current = true;

      try {
        const currentLocalGestor = sessionStorage.getItem("vcd_gestor_id");
        if (currentLocalGestor === sessionUser.id && sessionStorage.getItem("vcd_session_id")) {
          return;
        }

        const { data: existingGestor, error: fetchError } = await supabase
          .from("gestores")
          .select("*")
          .eq("id", sessionUser.id)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          console.error("[Session] Error fetching existing gestor:", fetchError);
        }

        if (!existingGestor) {
          console.log("[Session] Creating new gestor record for Google Auth user:", sessionUser.id);
          const metadata = sessionUser.user_metadata || {};
          const fullName =
            (metadata.full_name as string | undefined) ||
            (metadata.name as string | undefined) ||
            sessionUser.email?.split("@")[0] ||
            "Novo Gestor";
          const avatarUrl = (metadata.avatar_url as string | undefined) || null;

          const { error: upsertError } = await supabase.from("gestores").upsert(
            {
              id: sessionUser.id,
              nome: fullName,
              foto_url: avatarUrl,
              senha: "google-oauth",
              dados_completos: false,
              foto_preenchida: !!avatarUrl,
              onboarding_completo: false,
              // SECURITY: never auto-assign agency on OAuth signup.
              // Agency membership must be granted by backend/admin flow.
              agencia_id: null,
            },
            { onConflict: "id" }
          );

          if (upsertError) {
            console.error("[Session] Failed to upsert new gestor:", upsertError);
            return;
          }
          console.log("[Session] Successfully created gestor record");
        }

        // SECURITY HOTFIX:
        // if this is a Google-created account and somehow has agency linked,
        // remove the link to avoid accidental cross-tenant access.
        if (existingGestor?.senha === "google-oauth" && existingGestor?.agencia_id) {
          const { error: clearAgencyError } = await supabase
            .from("gestores")
            .update({ agencia_id: null })
            .eq("id", sessionUser.id);

          if (clearAgencyError) {
            console.error("[Session] Failed to clear OAuth agency link:", clearAgencyError);
          }
        }

        const { data: finalGestor, error: finalFetchError } = await supabase
          .from("gestores")
          .select("*")
          .eq("id", sessionUser.id)
          .single();

        if (finalFetchError || !finalGestor) {
          console.error("[Session] Error fetching gestor after sync:", finalFetchError);
          return;
        }

        const { data: sessionData, error: localSessionError } = await supabase
          .from("gestor_sessions")
          .insert({ gestor_id: sessionUser.id, duration_seconds: 0 })
          .select()
          .single();

        if (localSessionError || !sessionData) {
          console.error("[Session] Failed to create local gestor session:", localSessionError);
          return;
        }

        const now = new Date();
        // @ts-ignore - Handle missing is_admin
        setGestor({ ...finalGestor, is_admin: false });
        setIsFirstLogin(!finalGestor.first_login_at);
        setSessionId(sessionData.id);
        setSessionStartTime(now);
        setSessionDuration(0);
        lastSavedDurationRef.current = 0;

        sessionStorage.setItem("vcd_gestor_id", finalGestor.id);
        sessionStorage.setItem("vcd_session_id", sessionData.id);
        sessionStorage.setItem("vcd_session_start", now.toISOString());
        sessionStorage.setItem("vcd_unlocked", "true");

        if (finalGestor.agencia_id) {
          const { data: agencyData } = await supabase
            .from("agencias")
            .select("*")
            .eq("id", finalGestor.agencia_id)
            .single();
          if (agencyData) setAgencia(agencyData as unknown as Agencia);
        }
      } catch (err) {
        console.error("[Session] Error syncing Supabase Auth:", err);
      } finally {
        oauthSyncInProgressRef.current = false;
      }
    };

    // Auth listener for Supabase Auth (Google OAuth)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === "INITIAL_SESSION" || event === "SIGNED_IN") && session?.user) {
        await syncSupabaseOAuthSession(session.user as unknown as { id: string; email?: string; user_metadata?: Record<string, unknown> });
      } else if (event === "SIGNED_OUT") {
        setGestor(null);
        setSessionId(null);
        setSessionStartTime(null);
        setSessionDuration(0);
        setIsFirstLogin(false);
        sessionStorage.removeItem("vcd_gestor_id");
        sessionStorage.removeItem("vcd_session_id");
        sessionStorage.removeItem("vcd_session_start");
        sessionStorage.removeItem("vcd_unlocked");
      }
    });

    // Also sync immediately in case the session is already present after redirect
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        syncSupabaseOAuthSession(data.session.user as unknown as { id: string; email?: string; user_metadata?: Record<string, unknown> });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Apply agency colors to CSS variables
  useEffect(() => {
    if (agencia) {
      const root = document.documentElement;
      if (agencia.cor_primaria) {
        root.style.setProperty("--agency-primary", agencia.cor_primaria);
        // Also update standard shadcn primary if possible, but safely
        // Most shadcn themes use HSL, so hex to hsl conversion would be better,
        // but for now let's just use the hex directly if supported or set custom vars.
      }
      if (agencia.cor_secundaria) {
        root.style.setProperty("--agency-secondary", agencia.cor_secundaria);
      }
    }
  }, [agencia]);

  // Update session duration every second (for display)
  useEffect(() => {
    if (!sessionStartTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000);
      setSessionDuration(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  // CRITICAL: Save session duration to database every 30 seconds
  useEffect(() => {
    if (!sessionId || !sessionStartTime) {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
        saveIntervalRef.current = null;
      }
      return;
    }

    // Save immediately when session starts
    saveSessionDuration();

    // Set up periodic saving
    saveIntervalRef.current = setInterval(() => {
      saveSessionDuration();
    }, SAVE_INTERVAL);

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
        saveIntervalRef.current = null;
      }
    };
  }, [sessionId, sessionStartTime, saveSessionDuration]);

  // Save on visibility change (tab hidden/shown)
  useEffect(() => {
    if (!sessionId) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        saveSessionDuration();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [sessionId, saveSessionDuration]);

  // Save on page unload using sendBeacon (best-effort)
  useEffect(() => {
    if (!sessionId || !sessionStartTime) return;

    const handleBeforeUnload = () => {
      const storedStart = sessionStorage.getItem("vcd_session_start");
      const storedSessionId = sessionStorage.getItem("vcd_session_id");

      if (!storedStart || !storedSessionId) return;

      const startTime = new Date(storedStart);
      const now = new Date();
      const durationSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);

      // Use sendBeacon for reliable data sending even when page is closing
      const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/gestor_sessions?id=eq.${storedSessionId}`;
      const data = JSON.stringify({ duration_seconds: durationSeconds });
      const blob = new Blob([data], { type: "application/json" });
      navigator.sendBeacon(url, blob);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [sessionId, sessionStartTime]);

  const login = async (gestorId: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Verify password
      const { data: gestorData, error } = await supabase
        .from("gestores")
        .select(
          "id, nome, foto_url, telefone, senha, onboarding_completo, foto_preenchida, dados_completos, first_login_at, welcome_modal_dismissed, agencia_id"
        )
        .eq("id", gestorId)
        .single();

      const isFirstTimeLogin = !gestorData?.first_login_at;

      if (error || !gestorData) {
        return { success: false, error: "Gestor não encontrado" };
      }

      if (gestorData.senha !== password) {
        return { success: false, error: "Senha incorreta" };
      }

      // Create session
      const { data: sessionData, error: sessionError } = await supabase
        .from("gestor_sessions")
        .insert({ gestor_id: gestorId, duration_seconds: 0 })
        .select()
        .single();

      if (sessionError) {
        console.error("Session error:", sessionError);
        return { success: false, error: "Erro ao criar sessão" };
      }

      const now = new Date();

      // Store in state and sessionStorage
      setGestor({
        id: gestorData.id,
        nome: gestorData.nome,
        foto_url: gestorData.foto_url,
        telefone: gestorData.telefone,
        onboarding_completo: gestorData.onboarding_completo,
        foto_preenchida: gestorData.foto_preenchida,
        dados_completos: gestorData.dados_completos,
        first_login_at: gestorData.first_login_at,
        welcome_modal_dismissed: gestorData.welcome_modal_dismissed,
        agencia_id: gestorData.agencia_id,
        is_admin: false,
      });
      setIsFirstLogin(isFirstTimeLogin);
      setSessionId(sessionData.id);
      setSessionStartTime(now);
      setSessionDuration(0);
      lastSavedDurationRef.current = 0;

      sessionStorage.setItem("vcd_gestor_id", gestorId);
      sessionStorage.setItem("vcd_session_id", sessionData.id);
      sessionStorage.setItem("vcd_session_start", now.toISOString());
      sessionStorage.setItem("vcd_unlocked", "true");

      console.log("[Session] Login successful, session created:", sessionData.id);

      return { success: true };
    } catch (err) {
      console.error("Login error:", err);
      return { success: false, error: "Erro ao fazer login" };
    }
  };

  const setAgenciaBySlug = async (slug: string): Promise<{ success: boolean; agency?: Agencia; error?: string }> => {
    const { data, error } = await supabase
      .from("agencias")
      .select("*")
      .eq("slug", slug.toLowerCase())
      .single();

    if (error || !data) {
      return { success: false, error: "Agência não encontrada" };
    }

    setAgencia(data as unknown as Agencia);
    sessionStorage.setItem("vurp_agency_slug", (data as unknown as Agencia).slug);
    return { success: true, agency: data as unknown as Agencia };
  };

  const logout = async () => {
    // Save final duration with logout timestamp
    await saveSessionDuration(true);
    await supabase.auth.signOut();

    setGestor(null);
    setAgencia(null);
    setSessionId(null);
    setSessionStartTime(null);
    setSessionDuration(0);
    setIsFirstLogin(false);
    lastSavedDurationRef.current = 0;

    sessionStorage.removeItem("vcd_gestor_id");
    sessionStorage.removeItem("vurp_agency_slug");
    sessionStorage.removeItem("vcd_session_id");
    sessionStorage.removeItem("vcd_session_start");
    sessionStorage.removeItem("vcd_unlocked");

    console.log("[Session] Logout complete");
  };

  const markWelcomeSeen = async () => {
    if (!gestor) return;

    await supabase
      .from("gestores")
      .update({ first_login_at: new Date().toISOString() })
      .eq("id", gestor.id);

    setIsFirstLogin(false);
    setGestor({ ...gestor, first_login_at: new Date().toISOString() });
  };

  const updatePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!gestor) {
      return { success: false, error: "Não está logado" };
    }

    const { error } = await supabase
      .from("gestores")
      .update({ senha: newPassword })
      .eq("id", gestor.id);

    if (error) {
      return { success: false, error: "Erro ao atualizar senha" };
    }

    return { success: true };
  };

  const refreshGestor = useCallback(async () => {
    if (!gestor) return;

    const { data } = await supabase
      .from("gestores")
      .select(
        "id, nome, foto_url, telefone, onboarding_completo, foto_preenchida, dados_completos, first_login_at, welcome_modal_dismissed, agencia_id"
      )
      .eq("id", gestor.id)
      .single();

    if (data) {
      // @ts-ignore - Handle missing is_admin
      setGestor({ ...data, is_admin: false });
    }
  }, [gestor]);

  return (
    <GestorContext.Provider
      value={{
        gestor,
        agencia,
        sessionId,
        sessionStartTime,
        sessionDuration,
        isLoggedIn: !!gestor,
        isFirstLogin,
        login,
        logout,
        updatePassword,
        refreshGestor,
        markWelcomeSeen,
        setAgenciaBySlug,
      }}
    >
      {children}
    </GestorContext.Provider>
  );
};

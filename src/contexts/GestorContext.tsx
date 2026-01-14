import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Gestor {
  id: string;
  nome: string;
  foto_url: string | null;
  telefone: string | null;
  onboarding_completo: boolean;
  foto_preenchida: boolean;
  dados_completos: boolean;
  first_login_at: string | null;
}

interface GestorContextType {
  gestor: Gestor | null;
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
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

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
        .select("id, nome, foto_url, telefone, onboarding_completo, foto_preenchida, dados_completos, first_login_at")
        .eq("id", storedGestorId)
        .single()
        .then(({ data }) => {
          if (data) {
            setGestor(data);
          }
        });
    }
  }, []);

  // Update session duration every second
  useEffect(() => {
    if (!sessionStartTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000);
      setSessionDuration(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  const login = async (gestorId: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Verify password
      const { data: gestorData, error } = await supabase
        .from("gestores")
        .select("id, nome, foto_url, telefone, senha, onboarding_completo, foto_preenchida, dados_completos, first_login_at")
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
        .insert({ gestor_id: gestorId })
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
      });
      setIsFirstLogin(isFirstTimeLogin);
      setSessionId(sessionData.id);
      setSessionStartTime(now);
      setSessionDuration(0);

      sessionStorage.setItem("vcd_gestor_id", gestorId);
      sessionStorage.setItem("vcd_session_id", sessionData.id);
      sessionStorage.setItem("vcd_session_start", now.toISOString());
      sessionStorage.setItem("vcd_unlocked", "true");

      return { success: true };
    } catch (err) {
      console.error("Login error:", err);
      return { success: false, error: "Erro ao fazer login" };
    }
  };

  const logout = async () => {
    if (sessionId && sessionStartTime) {
      const now = new Date();
      const durationSeconds = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000);

      await supabase
        .from("gestor_sessions")
        .update({
          logout_at: now.toISOString(),
          duration_seconds: durationSeconds,
        })
        .eq("id", sessionId);
    }

    setGestor(null);
    setSessionId(null);
    setSessionStartTime(null);
    setSessionDuration(0);
    setIsFirstLogin(false);

    sessionStorage.removeItem("vcd_gestor_id");
    sessionStorage.removeItem("vcd_session_id");
    sessionStorage.removeItem("vcd_session_start");
    sessionStorage.removeItem("vcd_unlocked");
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
      .select("id, nome, foto_url, telefone, onboarding_completo, foto_preenchida, dados_completos, first_login_at")
      .eq("id", gestor.id)
      .single();

    if (data) {
      setGestor(data);
    }
  }, [gestor]);

  return (
    <GestorContext.Provider
      value={{
        gestor,
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
      }}
    >
      {children}
    </GestorContext.Provider>
  );
};

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGestor } from "@/contexts/GestorContext";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  points: number;
  category: string;
  requirement_type: string;
  requirement_value: number;
}

interface GestorStats {
  clientsCount: number;
  reportsCount: number;
  hoursLogged: number;
  perfectChecklists: number;
  templatesCreated: number;
  profileComplete: boolean;
  photoAdded: boolean;
  firstLogin: boolean;
}

export const useAchievements = () => {
  const { gestor, sessionDuration } = useGestor();
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);
  const lastCheckRef = useRef<number>(0);
  const isCheckingRef = useRef<boolean>(false);
  const hasInitializedRef = useRef<boolean>(false);

  const gestorId = gestor?.id;

  // Fetch all achievements - with long cache
  const { data: achievements = [] } = useQuery({
    queryKey: ["achievements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .order("category", { ascending: true });
      if (error) throw error;
      return data as Achievement[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Fetch unlocked achievements
  const { data: unlockedAchievements = [], refetch: refetchUnlocked } = useQuery({
    queryKey: ["gestor-achievements", gestorId],
    queryFn: async () => {
      if (!gestorId) return [];
      const { data, error } = await supabase
        .from("gestor_achievements")
        .select("achievement_id")
        .eq("gestor_id", gestorId);
      if (error) throw error;
      return data.map((ua) => ua.achievement_id);
    },
    enabled: !!gestorId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });

  // Fetch gestor stats - less frequently
  const { data: gestorStats } = useQuery({
    queryKey: ["gestor-stats", gestorId],
    queryFn: async (): Promise<GestorStats | null> => {
      if (!gestorId || !gestor) return null;

      // Get clients count
      const { count: clientsCount } = await supabase
        .from("clientes")
        .select("*", { count: "exact", head: true })
        .eq("gestor_id", gestorId);

      // Get reports count
      const { data: clientIds } = await supabase
        .from("clientes")
        .select("id")
        .eq("gestor_id", gestorId);

      let reportsCount = 0;
      if (clientIds && clientIds.length > 0) {
        const { count } = await supabase
          .from("client_reports")
          .select("*", { count: "exact", head: true })
          .in("cliente_id", clientIds.map((c) => c.id));
        reportsCount = count || 0;
      }

      // Get total hours from sessions
      const { data: sessions } = await supabase
        .from("gestor_sessions")
        .select("duration_seconds")
        .eq("gestor_id", gestorId);

      const totalSeconds = (sessions || []).reduce(
        (sum, s) => sum + (s.duration_seconds || 0),
        0
      );
      const hoursLogged = Math.floor(totalSeconds / 3600);

      // Get perfect checklists (all true)
      let perfectChecklists = 0;
      if (clientIds && clientIds.length > 0) {
        const { data: checklists } = await supabase
          .from("checklists")
          .select("*")
          .in("cliente_id", clientIds.map((c) => c.id));

        perfectChecklists = (checklists || []).filter(
          (c) =>
            c.integracao_crm &&
            c.conversoes_configuradas &&
            c.pixel_tag_instalados &&
            c.saldo_suficiente &&
            c.conta_sem_bloqueios &&
            c.pagamento_ok &&
            c.teste_ab_ativo &&
            c.cta_claro &&
            c.criativos_atualizados
        ).length;
      }

      // Get templates created
      const { count: templatesCreated } = await supabase
        .from("report_templates")
        .select("*", { count: "exact", head: true })
        .eq("gestor_id", gestorId);

      return {
        clientsCount: clientsCount || 0,
        reportsCount,
        hoursLogged,
        perfectChecklists,
        templatesCreated: templatesCreated || 0,
        profileComplete: gestor.dados_completos,
        photoAdded: gestor.foto_preenchida,
        firstLogin: !!gestor.first_login_at,
      };
    },
    enabled: !!gestorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    refetchOnWindowFocus: false,
  });

  // Memoize unlocked set to prevent recreating on each render
  const unlockedSet = useMemo(() => new Set(unlockedAchievements), [unlockedAchievements]);

  // Unlock achievement mutation
  const unlockMutation = useMutation({
    mutationFn: async (achievementId: string) => {
      if (!gestorId) throw new Error("No gestor");

      const { error } = await supabase
        .from("gestor_achievements")
        .insert({
          gestor_id: gestorId,
          achievement_id: achievementId,
        });

      if (error && error.code !== "23505") throw error; // Ignore duplicate
    },
    onSuccess: () => {
      refetchUnlocked();
    },
  });

  // Check achievements function - stable reference
  const checkAchievements = useCallback(() => {
    if (!gestorId || !gestorStats || !achievements.length) return;
    if (isCheckingRef.current) return;
    
    // Debounce: only check every 60 seconds
    const now = Date.now();
    if (now - lastCheckRef.current < 60000) return;
    lastCheckRef.current = now;
    isCheckingRef.current = true;

    const currentHours = gestorStats.hoursLogged + Math.floor(sessionDuration / 3600);

    for (const achievement of achievements) {
      if (unlockedSet.has(achievement.id)) continue;

      let shouldUnlock = false;

      switch (achievement.requirement_type) {
        case "first_login":
          shouldUnlock = gestorStats.firstLogin;
          break;
        case "profile_complete":
          shouldUnlock = gestorStats.profileComplete;
          break;
        case "photo_added":
          shouldUnlock = gestorStats.photoAdded;
          break;
        case "clients_count":
          shouldUnlock = gestorStats.clientsCount >= achievement.requirement_value;
          break;
        case "reports_count":
          shouldUnlock = gestorStats.reportsCount >= achievement.requirement_value;
          break;
        case "hours_logged":
          shouldUnlock = currentHours >= achievement.requirement_value;
          break;
        case "perfect_checklists":
          shouldUnlock = gestorStats.perfectChecklists >= achievement.requirement_value;
          break;
        case "templates_created":
          shouldUnlock = gestorStats.templatesCreated >= achievement.requirement_value;
          break;
      }

      if (shouldUnlock) {
        unlockMutation.mutate(achievement.id);
        setNewlyUnlocked(achievement);
        isCheckingRef.current = false;
        return; // Only show one at a time
      }
    }
    
    isCheckingRef.current = false;
  }, [gestorId, gestorStats, achievements, unlockedSet, sessionDuration, unlockMutation]);

  // Initial check only once when all data is ready
  useEffect(() => {
    if (!gestorId || !gestorStats || hasInitializedRef.current) return;
    
    hasInitializedRef.current = true;
    const timer = setTimeout(checkAchievements, 3000);
    return () => clearTimeout(timer);
  }, [gestorId, gestorStats, checkAchievements]);

  const dismissNewlyUnlocked = useCallback(() => {
    setNewlyUnlocked(null);
  }, []);

  return {
    achievements,
    unlockedAchievements,
    newlyUnlocked,
    dismissNewlyUnlocked,
    checkAchievements,
    gestorStats,
  };
};

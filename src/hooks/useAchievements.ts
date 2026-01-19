import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);
  const lastCheckRef = useRef<number>(0);
  const isCheckingRef = useRef<boolean>(false);

  // Fetch all achievements
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  });

  // Fetch unlocked achievements
  const { data: unlockedAchievements = [], refetch: refetchUnlocked } = useQuery({
    queryKey: ["gestor-achievements", gestor?.id],
    queryFn: async () => {
      if (!gestor?.id) return [];
      const { data, error } = await supabase
        .from("gestor_achievements")
        .select("achievement_id")
        .eq("gestor_id", gestor.id);
      if (error) throw error;
      return data.map((ua) => ua.achievement_id);
    },
    enabled: !!gestor?.id,
    staleTime: 60 * 1000, // 1 minute
  });

  // Fetch gestor stats for achievement checking - less frequently
  const { data: gestorStats } = useQuery({
    queryKey: ["gestor-stats", gestor?.id],
    queryFn: async (): Promise<GestorStats | null> => {
      if (!gestor?.id) return null;

      // Get clients count
      const { count: clientsCount } = await supabase
        .from("clientes")
        .select("*", { count: "exact", head: true })
        .eq("gestor_id", gestor.id);

      // Get reports count
      const { data: clientIds } = await supabase
        .from("clientes")
        .select("id")
        .eq("gestor_id", gestor.id);

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
        .eq("gestor_id", gestor.id);

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
        .eq("gestor_id", gestor.id);

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
    enabled: !!gestor?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes instead of 1
  });

  // Unlock achievement mutation
  const unlockMutation = useMutation({
    mutationFn: async (achievementId: string) => {
      if (!gestor?.id) throw new Error("No gestor");

      const { error } = await supabase
        .from("gestor_achievements")
        .insert({
          gestor_id: gestor.id,
          achievement_id: achievementId,
        });

      if (error && error.code !== "23505") throw error; // Ignore duplicate
    },
    onSuccess: () => {
      refetchUnlocked();
    },
  });

  // Check and unlock achievements - with debounce
  const checkAchievements = useCallback(() => {
    if (!gestor || !gestorStats || !achievements.length) return;
    if (isCheckingRef.current) return;
    
    // Debounce: only check every 30 seconds
    const now = Date.now();
    if (now - lastCheckRef.current < 30000) return;
    lastCheckRef.current = now;
    isCheckingRef.current = true;

    const unlockedSet = new Set(unlockedAchievements);
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
  }, [gestor?.id, gestorStats, achievements, unlockedAchievements, sessionDuration, unlockMutation]);

  // Check achievements on mount and when stats change significantly
  useEffect(() => {
    if (!gestor?.id || !gestorStats) return;

    // Initial check after a delay
    const timer = setTimeout(checkAchievements, 2000);
    return () => clearTimeout(timer);
  }, [gestor?.id, gestorStats?.clientsCount, gestorStats?.reportsCount]);

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

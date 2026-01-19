import { useState, useEffect, useCallback } from "react";
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
  });

  // Fetch gestor stats for achievement checking
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
        hoursLogged: hoursLogged + Math.floor(sessionDuration / 3600), // Include current session
        perfectChecklists,
        templatesCreated: templatesCreated || 0,
        profileComplete: gestor.dados_completos,
        photoAdded: gestor.foto_preenchida,
        firstLogin: !!gestor.first_login_at,
      };
    },
    enabled: !!gestor?.id,
    refetchInterval: 60000, // Refetch every minute
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
      queryClient.invalidateQueries({ queryKey: ["gestor-achievements"] });
    },
  });

  // Check and unlock achievements
  const checkAchievements = useCallback(() => {
    if (!gestor || !gestorStats || !achievements.length) return;

    const unlockedSet = new Set(unlockedAchievements);

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
          shouldUnlock = gestorStats.hoursLogged >= achievement.requirement_value;
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
        break; // Only show one at a time
      }
    }
  }, [gestor, gestorStats, achievements, unlockedAchievements, unlockMutation]);

  // Check achievements periodically
  useEffect(() => {
    if (!gestor) return;

    checkAchievements();

    const interval = setInterval(checkAchievements, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [checkAchievements, gestor]);

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

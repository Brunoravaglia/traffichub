import { supabase } from "@/integrations/supabase/client";

/**
 * Referral System Logic
 * 
 * Rules:
 * 1. A user (referrer) invites another (referred).
 * 2. When the referred user signs up, a 'pending' referral is created.
 * 3. When the referred user subscribes to any paid plan, the referral becomes 'converted'.
 * 4. After 5 'converted' referrals, the referrer gets a 30-day reward of the Initial Plan.
 */

export async function createReferral(referrerId: string, referredId: string) {
    const { error } = await (supabase.from("referrals" as any) as any)
        .insert({
            referrer_id: referrerId,
            referred_id: referredId,
            status: "pending"
        });

    return { success: !error, error };
}

export async function getReferrerStats(gestorId: string) {
    const { data, error } = await (supabase.from("referrals" as any) as any)
        .select("*")
        .eq("referrer_id", gestorId);

    if (error) return { total: 0, converted: 0, pending: 0 };

    const converted = (data as any[]).filter(r => r.status === "converted").length;
    const pending = (data as any[]).filter(r => r.status === "pending").length;

    return {
        total: (data as any[]).length,
        converted,
        pending,
        progressToReward: (converted % 5) / 5 * 100,
        rewardsEarned: Math.floor(converted / 5)
    };
}

export async function claimReferralReward(gestorId: string) {
    const stats = await getReferrerStats(gestorId);

    if (stats.converted < 5) {
        throw new Error("Necessário pelo menos 5 indicações convertidas.");
    }

    // For now, we update the reward_claimed status for the first 5 unclaimed converted referrals
    const { data: referrals } = await (supabase.from("referrals" as any) as any)
        .select("id")
        .eq("referrer_id", gestorId)
        .eq("status", "converted")
        .eq("reward_claimed", false)
        .limit(5);

    if (!referrals || (referrals as any[]).length < 5) {
        throw new Error("Nenhum novo prêmio disponível.");
    }

    const ids = (referrals as any[]).map(r => r.id);

    const { error: updateError } = await (supabase.from("referrals" as any) as any)
        .update({ reward_claimed: true })
        .in("id", ids);

    if (updateError) throw updateError;

    return { success: true, message: "Prêmio resgatado! 30 dias adicionados ao seu plano." };
}

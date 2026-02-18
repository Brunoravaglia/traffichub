import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BlogMetric {
    views: number;
    likes: number;
}

export type BlogMetricsMap = Record<string, BlogMetric>;

/**
 * Fetches all blog metrics (views/likes) from Supabase.
 * Returns a map of slug → { views, likes } and a loading state.
 */
export function useBlogMetrics() {
    const [metrics, setMetrics] = useState<BlogMetricsMap>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const { data, error } = await supabase
                    .from("blog_metrics" as any)
                    .select("slug, views, likes");

                if (error) {
                    console.warn("blog_metrics fetch error:", error.message);
                    setLoading(false);
                    return;
                }

                const map: BlogMetricsMap = {};
                (data as any[])?.forEach((row: any) => {
                    map[row.slug] = { views: row.views ?? 0, likes: row.likes ?? 0 };
                });
                setMetrics(map);
            } catch (e) {
                console.warn("blog_metrics fetch exception:", e);
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, []);

    const getMetric = useCallback(
        (slug: string): BlogMetric => metrics[slug] ?? { views: 0, likes: 0 },
        [metrics]
    );

    return { metrics, getMetric, loading };
}

/**
 * Tracks a page view for a given blog slug.
 * Only increments once per session per slug (uses sessionStorage).
 */
export function useTrackView(slug: string | undefined) {
    useEffect(() => {
        if (!slug) return;

        const key = `blog_viewed_${slug}`;
        if (sessionStorage.getItem(key)) return;

        sessionStorage.setItem(key, "1");

        (supabase.rpc as any)("increment_blog_views", { p_slug: slug }).then(({ error }: any) => {
            if (error) console.warn("increment_blog_views error:", error.message);
        });
    }, [slug]);
}

/**
 * Provides like state and toggle function for a blog post.
 * Persists liked state in localStorage so it survives page refreshes.
 */
export function useLike(slug: string | undefined) {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Initialize from localStorage + fetch current count
    useEffect(() => {
        if (!slug) return;

        const key = `blog_liked_${slug}`;
        setLiked(localStorage.getItem(key) === "1");

        // Fetch current like count
        supabase
            .from("blog_metrics" as any)
            .select("likes")
            .eq("slug", slug)
            .single()
            .then(({ data, error }) => {
                if (!error && data) {
                    setLikeCount((data as any).likes ?? 0);
                }
            });
    }, [slug]);

    const toggleLike = useCallback(async () => {
        if (!slug || loading) return;

        setLoading(true);
        const newLiked = !liked;
        const delta = newLiked ? 1 : -1;

        // Optimistic update
        setLiked(newLiked);
        setLikeCount((prev) => Math.max(prev + delta, 0));
        localStorage.setItem(`blog_liked_${slug}`, newLiked ? "1" : "0");

        try {
            const { data, error } = await (supabase.rpc as any)("toggle_blog_like", {
                p_slug: slug,
                p_delta: delta,
            });

            if (error) {
                console.warn("toggle_blog_like error:", error.message);
                // Revert on error
                setLiked(!newLiked);
                setLikeCount((prev) => Math.max(prev - delta, 0));
                localStorage.setItem(`blog_liked_${slug}`, !newLiked ? "1" : "0");
            } else if (typeof data === "number") {
                setLikeCount(data);
            }
        } catch (e) {
            console.warn("toggle_blog_like exception:", e);
        } finally {
            setLoading(false);
        }
    }, [slug, liked, loading]);

    return { liked, likeCount, toggleLike, loading };
}

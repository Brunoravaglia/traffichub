-- Blog engagement metrics: views and likes per article slug
CREATE TABLE public.blog_metrics (
  slug TEXT PRIMARY KEY,
  views INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_metrics ENABLE ROW LEVEL SECURITY;

-- Public read (blog is public, no auth needed)
CREATE POLICY "Public read blog_metrics" ON public.blog_metrics FOR SELECT USING (true);
CREATE POLICY "Public insert blog_metrics" ON public.blog_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update blog_metrics" ON public.blog_metrics FOR UPDATE USING (true);

-- Atomic view increment (upserts to avoid race conditions)
CREATE OR REPLACE FUNCTION increment_blog_views(p_slug TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO public.blog_metrics (slug, views) VALUES (p_slug, 1)
  ON CONFLICT (slug) DO UPDATE SET views = blog_metrics.views + 1, updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic like toggle (+1 or -1)
CREATE OR REPLACE FUNCTION toggle_blog_like(p_slug TEXT, p_delta INTEGER)
RETURNS INTEGER AS $$
DECLARE new_likes INTEGER;
BEGIN
  INSERT INTO public.blog_metrics (slug, likes) VALUES (p_slug, GREATEST(p_delta, 0))
  ON CONFLICT (slug) DO UPDATE SET likes = GREATEST(blog_metrics.likes + p_delta, 0), updated_at = now()
  RETURNING likes INTO new_likes;
  RETURN new_likes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

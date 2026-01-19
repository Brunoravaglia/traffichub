-- Create achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'trophy',
  rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  points INTEGER NOT NULL DEFAULT 10,
  category TEXT NOT NULL DEFAULT 'geral',
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create gestor achievements (unlocked achievements)
CREATE TABLE public.gestor_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gestor_id UUID NOT NULL REFERENCES public.gestores(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  shared_linkedin BOOLEAN DEFAULT false,
  UNIQUE(gestor_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gestor_achievements ENABLE ROW LEVEL SECURITY;

-- Achievements are readable by everyone
CREATE POLICY "Achievements are viewable by everyone" 
ON public.achievements FOR SELECT USING (true);

-- Gestor achievements policies
CREATE POLICY "Gestor achievements are viewable by everyone" 
ON public.gestor_achievements FOR SELECT USING (true);

CREATE POLICY "Gestors can insert their own achievements" 
ON public.gestor_achievements FOR INSERT WITH CHECK (true);

CREATE POLICY "Gestors can update their own achievements" 
ON public.gestor_achievements FOR UPDATE USING (true);

-- Insert default achievements
INSERT INTO public.achievements (name, description, icon, rarity, points, category, requirement_type, requirement_value) VALUES
-- Onboarding
('Primeiro Passo', 'Complete seu primeiro login no sistema', 'rocket', 'common', 10, 'onboarding', 'first_login', 1),
('Perfil Completo', 'Preencha todos os dados do seu perfil', 'user-check', 'common', 15, 'onboarding', 'profile_complete', 1),
('Foto de Perfil', 'Adicione sua foto de perfil', 'camera', 'common', 10, 'onboarding', 'photo_added', 1),

-- Clientes
('Primeiro Cliente', 'Cadastre seu primeiro cliente', 'user-plus', 'common', 20, 'clientes', 'clients_count', 1),
('Gestor Dedicado', 'Tenha 5 clientes ativos', 'users', 'rare', 50, 'clientes', 'clients_count', 5),
('Líder de Carteira', 'Tenha 10 clientes ativos', 'crown', 'epic', 100, 'clientes', 'clients_count', 10),
('Magnata', 'Tenha 25 clientes ativos', 'gem', 'legendary', 250, 'clientes', 'clients_count', 25),

-- Relatórios
('Primeiro Relatório', 'Gere seu primeiro relatório', 'file-text', 'common', 20, 'relatorios', 'reports_count', 1),
('Relatório Semanal', 'Gere 5 relatórios', 'files', 'common', 30, 'relatorios', 'reports_count', 5),
('Analista de Dados', 'Gere 25 relatórios', 'bar-chart-2', 'rare', 75, 'relatorios', 'reports_count', 25),
('Mestre dos Relatórios', 'Gere 100 relatórios', 'award', 'epic', 150, 'relatorios', 'reports_count', 100),
('Lendário Analista', 'Gere 500 relatórios', 'star', 'legendary', 500, 'relatorios', 'reports_count', 500),

-- Tempo de uso
('Maratonista', 'Acumule 10 horas no sistema', 'clock', 'rare', 50, 'tempo', 'hours_logged', 10),
('Workaholic', 'Acumule 50 horas no sistema', 'zap', 'epic', 150, 'tempo', 'hours_logged', 50),
('Lenda Viva', 'Acumule 200 horas no sistema', 'flame', 'legendary', 400, 'tempo', 'hours_logged', 200),

-- Checklists
('Checklist Master', 'Complete 10 checklists com 100%', 'check-circle', 'rare', 60, 'checklists', 'perfect_checklists', 10),
('Perfeccionista', 'Complete 50 checklists com 100%', 'target', 'epic', 120, 'checklists', 'perfect_checklists', 50),

-- Modelos
('Criador de Templates', 'Crie seu primeiro modelo de relatório', 'layout', 'common', 25, 'modelos', 'templates_created', 1),
('Designer de Relatórios', 'Crie 5 modelos de relatório', 'palette', 'rare', 75, 'modelos', 'templates_created', 5);

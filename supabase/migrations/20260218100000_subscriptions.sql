-- Subscription and Referral System for VURP

-- 1. Planos (Plans)
CREATE TABLE public.planos (
    id TEXT PRIMARY KEY, -- 'free', 'initial', 'agency', 'pro'
    nome TEXT NOT NULL,
    preco_mensal DECIMAL(10, 2) NOT NULL,
    limite_relatorios_mes INTEGER NOT NULL, -- -1 for unlimited
    has_custom_branding BOOLEAN DEFAULT false,
    has_analytics BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

INSERT INTO public.planos (id, nome, preco_mensal, limite_relatorios_mes, has_custom_branding, has_analytics) VALUES
    ('free', 'Grátis', 0.00, 4, false, false), -- ~1 report/week
    ('initial', 'Plano Inicial', 97.00, 20, true, true),
    ('agency', 'Plano Agência', 297.00, -1, true, true),
    ('pro', 'Plano Agency Pro', 497.00, -1, true, true);

-- 2. Assinaturas (Subscriptions)
CREATE TABLE public.assinaturas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gestor_id UUID NOT NULL REFERENCES public.gestores(id) ON DELETE CASCADE,
    plano_id TEXT NOT NULL REFERENCES public.planos(id),
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'canceled', 'past_due'
    data_inicio TIMESTAMP WITH TIME ZONE DEFAULT now(),
    data_fim TIMESTAMP WITH TIME ZONE,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Referrals
CREATE TABLE public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES public.gestores(id),
    referred_id UUID UNIQUE NOT NULL REFERENCES public.gestores(id),
    status TEXT DEFAULT 'pending', -- 'pending', 'converted' (if referred upgrades)
    reward_claimed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Plan Limits Enforcement Function
CREATE OR REPLACE FUNCTION public.check_report_limit()
RETURNS TRIGGER AS $$
DECLARE
    v_gestor_id UUID;
    v_plano_id TEXT;
    v_limite INTEGER;
    v_count INTEGER;
BEGIN
    -- Get gestor_id from the client being reported
    SELECT gestor_id INTO v_gestor_id FROM public.clientes WHERE id = NEW.cliente_id;
    
    -- Get current plan and limit
    SELECT plano_id INTO v_plano_id FROM public.assinaturas WHERE gestor_id = v_gestor_id AND status = 'active' LIMIT 1;
    
    -- Default to free if no subscription found
    IF v_plano_id IS NULL THEN
        v_plano_id := 'free';
    END IF;
    
    SELECT limite_relatorios_mes INTO v_limite FROM public.planos WHERE id = v_plano_id;
    
    -- If unlimited, allow
    IF v_limite = -1 THEN
        RETURN NEW;
    END IF;
    
    -- Count reports by this gestor in the last 30 days
    -- We need to join with clientes to filter by gestor_id
    SELECT COUNT(*) INTO v_count 
    FROM public.client_reports r
    JOIN public.clientes c ON r.cliente_id = c.id
    WHERE c.gestor_id = v_gestor_id 
    AND r.created_at > (now() - interval '30 days');
    
    IF v_count >= v_limite THEN
        RAISE EXCEPTION 'Limite de relatórios mensal atingido para o plano %', v_plano_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger for Report Limit
CREATE TRIGGER tr_check_report_limit
    BEFORE INSERT ON public.client_reports
    FOR EACH ROW
    EXECUTE FUNCTION public.check_report_limit();

-- 6. Default Subscriptions for existing users
INSERT INTO public.assinaturas (gestor_id, plano_id)
SELECT id, 'free' FROM public.gestores
ON CONFLICT DO NOTHING;

-- RLS for Subscriptions
ALTER TABLE public.assinaturas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gestores can view own subscription" ON public.assinaturas FOR SELECT TO authenticated USING (auth.uid() = gestor_id);

-- RLS for Planos
ALTER TABLE public.planos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read planos" ON public.planos FOR SELECT USING (true);

-- RLS for Referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gestores can view their referrals" ON public.referrals FOR SELECT TO authenticated USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
CREATE POLICY "Gestores can insert referrals" ON public.referrals FOR INSERT TO authenticated WITH CHECK (auth.uid() = referrer_id);

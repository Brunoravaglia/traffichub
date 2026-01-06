-- Add new columns to clientes table for social networks, investment, and expectations
ALTER TABLE public.clientes 
ADD COLUMN redes_sociais text[] DEFAULT '{}',
ADD COLUMN investimento_mensal numeric DEFAULT 0,
ADD COLUMN expectativa_resultados text DEFAULT '';
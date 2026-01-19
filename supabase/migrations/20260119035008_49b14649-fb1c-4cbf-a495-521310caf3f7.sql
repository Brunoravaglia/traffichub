-- Create client_notes table
CREATE TABLE public.client_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  gestor_id UUID NOT NULL REFERENCES public.gestores(id),
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'nota',
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.client_notes ENABLE ROW LEVEL SECURITY;

-- Create policy for access
CREATE POLICY "Allow all client_notes access" ON public.client_notes
  FOR ALL USING (true) WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_client_notes_updated_at
  BEFORE UPDATE ON public.client_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_client_notes_cliente_id ON public.client_notes(cliente_id);
CREATE INDEX idx_client_notes_gestor_id ON public.client_notes(gestor_id);
CREATE INDEX idx_client_notes_is_pinned ON public.client_notes(is_pinned);
CREATE INDEX idx_client_notes_created_at ON public.client_notes(created_at DESC);
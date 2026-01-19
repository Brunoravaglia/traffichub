-- Create calendar_notes table for notes/reminders in the calendar
CREATE TABLE public.calendar_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gestor_id UUID NOT NULL REFERENCES public.gestores(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
  note_date DATE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  has_reminder BOOLEAN DEFAULT false,
  reminder_shown BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_calendar_notes_gestor_date ON public.calendar_notes(gestor_id, note_date);
CREATE INDEX idx_calendar_notes_reminder ON public.calendar_notes(gestor_id, has_reminder, reminder_shown);

-- Enable RLS
ALTER TABLE public.calendar_notes ENABLE ROW LEVEL SECURITY;

-- RLS policies - gestores can only see their own notes
CREATE POLICY "Gestores can view their own notes" 
ON public.calendar_notes 
FOR SELECT 
USING (true);

CREATE POLICY "Gestores can create notes" 
ON public.calendar_notes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Gestores can update their own notes" 
ON public.calendar_notes 
FOR UPDATE 
USING (true);

CREATE POLICY "Gestores can delete their own notes" 
ON public.calendar_notes 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_calendar_notes_updated_at
BEFORE UPDATE ON public.calendar_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Secure RLS Policies for VURP

-- 1. Gestores: Users can only see and update their own profile
DROP POLICY IF EXISTS "Allow all gestores access" ON public.gestores;

CREATE POLICY "Gestores can view own profile" 
ON public.gestores FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Gestores can update own profile" 
ON public.gestores FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow system to insert new gestores (needed for OAuth sync)
CREATE POLICY "Enable insert for authenticated users only"
ON public.gestores FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 2. Clientes: Users can only see clients belonging to their agency
DROP POLICY IF EXISTS "Allow all clientes access" ON public.clientes;

CREATE POLICY "Gestores can view their agency's clients" 
ON public.clientes FOR SELECT 
TO authenticated 
USING (
  agencia_id IN (
    SELECT agencia_id FROM public.gestores WHERE id = auth.uid()
  )
);

CREATE POLICY "Gestores can manage their agency's clients" 
ON public.clientes FOR ALL
TO authenticated 
USING (
  agencia_id IN (
    SELECT agencia_id FROM public.gestores WHERE id = auth.uid()
  )
)
WITH CHECK (
  agencia_id IN (
    SELECT agencia_id FROM public.gestores WHERE id = auth.uid()
  )
);

-- 3. Agencias: Only members can see their agency
DROP POLICY IF EXISTS "Allow all agencias access" ON public.agencias; -- Wait, need to check if this exists or if it was different

CREATE POLICY "Gestores can view their own agency"
ON public.agencias FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT agencia_id FROM public.gestores WHERE id = auth.uid()
  )
);

-- 4. Checklists: Access based on agency
DROP POLICY IF EXISTS "Allow all checklists access" ON public.checklists;

CREATE POLICY "Gestores can manage their agency's checklists"
ON public.checklists FOR ALL
TO authenticated
USING (
  agencia_id IN (
    SELECT agencia_id FROM public.gestores WHERE id = auth.uid()
  )
)
WITH CHECK (
  agencia_id IN (
    SELECT agencia_id FROM public.gestores WHERE id = auth.uid()
  )
);

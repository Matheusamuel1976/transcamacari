-- Isolates the municipal catalogue from each company's private operation.
-- Prepared locally; applying this migration requires separate authorization.
BEGIN;

ALTER TABLE public.company_access_codes
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;
UPDATE public.company_access_codes
SET expires_at = COALESCE(expires_at, created_at + interval '30 days');
ALTER TABLE public.company_access_codes
  ALTER COLUMN expires_at SET DEFAULT (now() + interval '30 days'),
  ALTER COLUMN expires_at SET NOT NULL;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_status_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_status_check
  CHECK (status IN ('active', 'pending', 'rejected', 'suspended'));

-- Company routes can never enter the municipal catalogue.
UPDATE public.linhas
SET publicado = false, origem_dados = 'empresa'
WHERE escopo_acesso = 'empresa_privada';

-- Authenticated business users do not inherit the anonymous municipal view.
DROP POLICY IF EXISTS "Public reads municipal catalogue" ON public.linhas;
DROP POLICY IF EXISTS "Visitors read municipal catalogue" ON public.linhas;
CREATE POLICY "Visitors read municipal catalogue" ON public.linhas FOR SELECT TO anon
USING (escopo_acesso='catalogo_publico' AND publicado=true AND visivel::text IN ('1','true'));
DROP POLICY IF EXISTS "Public reads municipal schedules" ON public.horarios;
DROP POLICY IF EXISTS "Visitors read municipal schedules" ON public.horarios;
CREATE POLICY "Visitors read municipal schedules" ON public.horarios FOR SELECT TO anon
USING (EXISTS (SELECT 1 FROM public.linhas l WHERE l.id=linha_id AND l.escopo_acesso='catalogo_publico' AND l.publicado=true AND l.visivel::text IN ('1','true')));
DROP POLICY IF EXISTS "Public reads municipal itinerary" ON public.itinerary_locais;
DROP POLICY IF EXISTS "Visitors read municipal itinerary" ON public.itinerary_locais;
CREATE POLICY "Visitors read municipal itinerary" ON public.itinerary_locais FOR SELECT TO anon
USING (EXISTS (SELECT 1 FROM public.linhas l WHERE l.id=linha_id AND l.escopo_acesso='catalogo_publico' AND l.publicado=true AND l.visivel::text IN ('1','true')));
DROP POLICY IF EXISTS "Public reads municipal geometries" ON public.route_geometries;
DROP POLICY IF EXISTS "Visitors read municipal geometries" ON public.route_geometries;
CREATE POLICY "Visitors read municipal geometries" ON public.route_geometries FOR SELECT TO anon
USING (EXISTS (SELECT 1 FROM public.linhas l WHERE l.id=linha_id AND l.escopo_acesso='catalogo_publico' AND l.publicado=true AND l.visivel::text IN ('1','true')));

-- The platform administrator manages the municipal catalogue only.
DROP POLICY IF EXISTS "Admins manage linhas" ON public.linhas;
DROP POLICY IF EXISTS "Admins manage municipal lines" ON public.linhas;
CREATE POLICY "Admins manage municipal lines" ON public.linhas FOR ALL TO authenticated
USING ((SELECT public.transport_is_admin()) AND escopo_acesso = 'catalogo_publico')
WITH CHECK ((SELECT public.transport_is_admin()) AND escopo_acesso = 'catalogo_publico' AND company_id IS NULL);
DROP POLICY IF EXISTS "Admins manage horarios" ON public.horarios;
DROP POLICY IF EXISTS "Admins manage municipal schedules" ON public.horarios;
CREATE POLICY "Admins manage municipal schedules" ON public.horarios FOR ALL TO authenticated
USING ((SELECT public.transport_is_admin()) AND EXISTS (SELECT 1 FROM public.linhas l WHERE l.id=linha_id AND l.escopo_acesso='catalogo_publico'))
WITH CHECK ((SELECT public.transport_is_admin()) AND EXISTS (SELECT 1 FROM public.linhas l WHERE l.id=linha_id AND l.escopo_acesso='catalogo_publico'));
DROP POLICY IF EXISTS "Admins manage itinerary_locais" ON public.itinerary_locais;
DROP POLICY IF EXISTS "Admins manage municipal itinerary" ON public.itinerary_locais;
CREATE POLICY "Admins manage municipal itinerary" ON public.itinerary_locais FOR ALL TO authenticated
USING ((SELECT public.transport_is_admin()) AND EXISTS (SELECT 1 FROM public.linhas l WHERE l.id=linha_id AND l.escopo_acesso='catalogo_publico'))
WITH CHECK ((SELECT public.transport_is_admin()) AND EXISTS (SELECT 1 FROM public.linhas l WHERE l.id=linha_id AND l.escopo_acesso='catalogo_publico'));
DROP POLICY IF EXISTS "Admins manage route_geometries" ON public.route_geometries;
DROP POLICY IF EXISTS "Admins manage municipal geometries" ON public.route_geometries;
CREATE POLICY "Admins manage municipal geometries" ON public.route_geometries FOR ALL TO authenticated
USING ((SELECT public.transport_is_admin()) AND EXISTS (SELECT 1 FROM public.linhas l WHERE l.id=linha_id AND l.escopo_acesso='catalogo_publico'))
WITH CHECK ((SELECT public.transport_is_admin()) AND EXISTS (SELECT 1 FROM public.linhas l WHERE l.id=linha_id AND l.escopo_acesso='catalogo_publico'));
DROP POLICY IF EXISTS "Admins manage companies" ON public.companies;
DROP POLICY IF EXISTS "Admins manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin manages profiles" ON public.profiles;

CREATE OR REPLACE FUNCTION public.transport_enforce_line_scope()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public AS $$
DECLARE p public.profiles%ROWTYPE;
BEGIN
  SELECT * INTO p FROM public.profiles WHERE id = auth.uid();
  IF p.role = 'company_admin' AND p.status = 'active' THEN
    IF p.company_id IS NULL THEN RAISE EXCEPTION 'Empresa não vinculada'; END IF;
    NEW.company_id := p.company_id;
    NEW.escopo_acesso := 'empresa_privada';
    NEW.publicado := false;
    NEW.situacao_rede := 'nao_verificada';
    NEW.fonte_id := NULL;
    NEW.origem_dados := 'empresa';
  END IF;
  RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.transport_enforce_line_scope() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS transport_enforce_line_scope ON public.linhas;
CREATE TRIGGER transport_enforce_line_scope BEFORE INSERT OR UPDATE ON public.linhas
FOR EACH ROW EXECUTE FUNCTION public.transport_enforce_line_scope();

-- Employees only see active, assigned routes from their own company.
DROP POLICY IF EXISTS "Employees read assigned private lines" ON public.linhas;
CREATE POLICY "Employees read assigned private lines" ON public.linhas FOR SELECT TO authenticated
USING (
  escopo_acesso = 'empresa_privada' AND visivel::text IN ('1','true')
  AND company_id = (SELECT public.transport_company_id())
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.profile_line_assignments a ON a.profile_id = p.id
    WHERE p.id = (SELECT auth.uid()) AND p.role = 'funcionario'
      AND p.status = 'active' AND a.linha_id = linhas.id
  )
);

DROP POLICY IF EXISTS "Employees read assigned schedules" ON public.horarios;
CREATE POLICY "Employees read assigned schedules" ON public.horarios FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.profile_line_assignments a
  JOIN public.profiles p ON p.id = a.profile_id
  JOIN public.linhas l ON l.id = a.linha_id
  WHERE a.linha_id = horarios.linha_id AND p.id = (SELECT auth.uid())
    AND p.role = 'funcionario' AND p.status = 'active'
    AND l.company_id = p.company_id AND l.escopo_acesso = 'empresa_privada'
    AND l.visivel::text IN ('1','true')
));

DROP POLICY IF EXISTS "Employees read assigned itinerary" ON public.itinerary_locais;
CREATE POLICY "Employees read assigned itinerary" ON public.itinerary_locais FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.profile_line_assignments a
  JOIN public.profiles p ON p.id = a.profile_id
  JOIN public.linhas l ON l.id = a.linha_id
  WHERE a.linha_id = itinerary_locais.linha_id AND p.id = (SELECT auth.uid())
    AND p.role = 'funcionario' AND p.status = 'active'
    AND l.company_id = p.company_id AND l.escopo_acesso = 'empresa_privada'
    AND l.visivel::text IN ('1','true')
));

DROP POLICY IF EXISTS "Employees read assigned geometries" ON public.route_geometries;
CREATE POLICY "Employees read assigned geometries" ON public.route_geometries FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.profile_line_assignments a
  JOIN public.profiles p ON p.id = a.profile_id
  JOIN public.linhas l ON l.id = a.linha_id
  WHERE a.linha_id = route_geometries.linha_id AND p.id = (SELECT auth.uid())
    AND p.role = 'funcionario' AND p.status = 'active'
    AND l.company_id = p.company_id AND l.escopo_acesso = 'empresa_privada'
    AND l.visivel::text IN ('1','true')
));

-- Profile ownership permits changing the display name only through this RPC.
DROP POLICY IF EXISTS "Update own profile name" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
REVOKE UPDATE ON public.profiles FROM authenticated;
CREATE OR REPLACE FUNCTION public.update_own_profile_name(p_name text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Autenticação necessária'; END IF;
  IF length(trim(COALESCE(p_name, ''))) NOT BETWEEN 2 AND 120 THEN
    RAISE EXCEPTION 'Nome inválido';
  END IF;
  UPDATE public.profiles SET name = trim(p_name) WHERE id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'Perfil não encontrado'; END IF;
END; $$;
REVOKE ALL ON FUNCTION public.update_own_profile_name(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_own_profile_name(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.complete_company_registration(company_name text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE uid uuid := auth.uid(); p public.profiles%ROWTYPE; cid bigint; code text; expiry timestamptz;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Autenticação necessária'; END IF;
  SELECT * INTO p FROM public.profiles WHERE id = uid FOR UPDATE;
  IF p.role = 'company_admin' AND p.company_id IS NOT NULL THEN
    RETURN jsonb_build_object('company_id', p.company_id);
  END IF;
  IF p.role <> 'operator' OR p.company_id IS NOT NULL OR length(trim(company_name)) < 2 THEN
    RAISE EXCEPTION 'Cadastro empresarial inválido';
  END IF;
  INSERT INTO public.companies(nome) VALUES (left(trim(company_name),150)) RETURNING id INTO cid;
  UPDATE public.profiles SET company_id=cid, role='company_admin', status='active' WHERE id=uid;
  code := upper(substr(encode(extensions.gen_random_bytes(8),'hex'),1,12));
  expiry := now() + interval '30 days';
  INSERT INTO public.company_access_codes(company_id,code_hash,rotated_by,expires_at)
  VALUES(cid,encode(extensions.digest(code,'sha256'),'hex'),uid,expiry);
  INSERT INTO public.profile_access_audit(company_id,actor_profile_id,target_profile_id,action,meta)
  VALUES(cid,uid,uid,'company.registered',left(trim(company_name),150));
  RETURN jsonb_build_object('company_id',cid,'code',code,'expires_at',expiry);
END; $$;

CREATE OR REPLACE FUNCTION public.rotate_company_invite()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE uid uuid := auth.uid(); cid bigint; code text; expiry timestamptz;
BEGIN
  IF NOT public.transport_is_company_admin() THEN RAISE EXCEPTION 'Acesso negado'; END IF;
  cid := public.transport_company_id();
  code := upper(substr(encode(extensions.gen_random_bytes(8),'hex'),1,12));
  expiry := now() + interval '30 days';
  INSERT INTO public.company_access_codes(company_id,code_hash,rotated_by,expires_at)
  VALUES(cid,encode(extensions.digest(code,'sha256'),'hex'),uid,expiry)
  ON CONFLICT(company_id) DO UPDATE SET code_hash=excluded.code_hash,created_at=now(),rotated_by=uid,expires_at=excluded.expires_at;
  INSERT INTO public.profile_access_audit(company_id,actor_profile_id,action) VALUES(cid,uid,'invite.regenerated');
  RETURN jsonb_build_object('code',code,'expires_at',expiry);
END; $$;

CREATE OR REPLACE FUNCTION public.request_employee_membership(company_code text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE uid uuid := auth.uid(); p public.profiles%ROWTYPE; cid bigint;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Autenticação necessária'; END IF;
  SELECT * INTO p FROM public.profiles WHERE id=uid FOR UPDATE;
  IF p.role='funcionario' AND p.company_id IS NOT NULL THEN RETURN jsonb_build_object('company_id',p.company_id,'status',p.status); END IF;
  IF p.role <> 'operator' OR p.company_id IS NOT NULL THEN RAISE EXCEPTION 'Perfil não pode solicitar vínculo'; END IF;
  SELECT company_id INTO cid FROM public.company_access_codes
  WHERE code_hash=encode(extensions.digest(upper(trim(company_code)),'sha256'),'hex') AND expires_at > now();
  IF cid IS NULL THEN RAISE EXCEPTION 'Código da empresa inválido ou expirado'; END IF;
  UPDATE public.profiles SET company_id=cid, role='funcionario', status='pending' WHERE id=uid;
  INSERT INTO public.profile_access_audit(company_id,actor_profile_id,target_profile_id,action) VALUES(cid,uid,uid,'team.register');
  RETURN jsonb_build_object('company_id',cid,'status','pending');
END; $$;

CREATE OR REPLACE FUNCTION public.reject_employee(p_profile_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE cid bigint;
BEGIN
  IF NOT public.transport_is_company_admin() THEN RAISE EXCEPTION 'Acesso negado'; END IF;
  cid:=public.transport_company_id();
  UPDATE public.profiles SET status='rejected'
  WHERE id=p_profile_id AND company_id=cid AND role='funcionario' AND status='pending';
  IF NOT FOUND THEN RAISE EXCEPTION 'Solicitação pendente não encontrada'; END IF;
  DELETE FROM public.profile_line_assignments WHERE profile_id=p_profile_id;
  INSERT INTO public.profile_access_audit(company_id,actor_profile_id,target_profile_id,action)
  VALUES(cid,auth.uid(),p_profile_id,'team.user.rejected');
END; $$;

CREATE OR REPLACE FUNCTION public.transport_create_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE cid bigint;
BEGIN
  IF NEW.email IS NULL THEN RETURN NEW; END IF;
  IF NEW.raw_user_meta_data->>'registration_kind' = 'employee' THEN
    SELECT company_id INTO cid FROM public.company_access_codes
    WHERE code_hash=encode(extensions.digest(upper(trim(COALESCE(NEW.raw_user_meta_data->>'company_code',''))),'sha256'),'hex')
      AND expires_at > now();
    IF cid IS NULL THEN RAISE EXCEPTION 'Código da empresa inválido ou expirado'; END IF;
    INSERT INTO public.profiles(id,company_id,name,email,role,status)
    VALUES(NEW.id,cid,left(COALESCE(NULLIF(NEW.raw_user_meta_data->>'name',''),NEW.email,'Usuário'),120),NEW.email,'funcionario','pending')
    ON CONFLICT(id) DO NOTHING;
    INSERT INTO public.profile_access_audit(company_id,actor_profile_id,target_profile_id,action)
    VALUES(cid,NEW.id,NEW.id,'team.register');
  ELSE
    INSERT INTO public.profiles(id,name,email,role,status)
    VALUES(NEW.id,left(COALESCE(NULLIF(NEW.raw_user_meta_data->>'name',''),NEW.email,'Usuário'),120),NEW.email,'operator','active')
    ON CONFLICT(id) DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.transport_create_profile() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.complete_company_registration(text), public.request_employee_membership(text),
  public.rotate_company_invite(), public.reject_employee(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_company_registration(text), public.request_employee_membership(text),
  public.rotate_company_invite(), public.reject_employee(uuid) TO authenticated;

COMMIT;

-- Qualify pgcrypto functions because the extension is installed in the extensions schema.
BEGIN;

CREATE OR REPLACE FUNCTION public.complete_company_registration(company_name text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE uid uuid := auth.uid(); p public.profiles%ROWTYPE; cid bigint; code text;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Autenticação necessária'; END IF;
  SELECT * INTO p FROM public.profiles WHERE id = uid FOR UPDATE;
  IF p.role = 'company_admin' AND p.company_id IS NOT NULL THEN RETURN jsonb_build_object('company_id', p.company_id); END IF;
  IF p.role <> 'operator' OR p.company_id IS NOT NULL OR length(trim(company_name)) < 2 THEN RAISE EXCEPTION 'Cadastro empresarial inválido'; END IF;
  INSERT INTO public.companies(nome) VALUES (left(trim(company_name),150)) RETURNING id INTO cid;
  UPDATE public.profiles SET company_id=cid, role='company_admin', status='active' WHERE id=uid;
  code := upper(substr(encode(extensions.gen_random_bytes(8),'hex'),1,12));
  INSERT INTO public.company_access_codes(company_id,code_hash,rotated_by)
  VALUES(cid,encode(extensions.digest(code,'sha256'),'hex'),uid);
  INSERT INTO public.profile_access_audit(company_id,actor_profile_id,target_profile_id,action,meta) VALUES(cid,uid,uid,'company.registered',left(trim(company_name),150));
  RETURN jsonb_build_object('company_id',cid,'code',code);
END; $$;

CREATE OR REPLACE FUNCTION public.request_employee_membership(company_code text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE uid uuid := auth.uid(); p public.profiles%ROWTYPE; cid bigint;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Autenticação necessária'; END IF;
  SELECT * INTO p FROM public.profiles WHERE id=uid FOR UPDATE;
  IF p.role='funcionario' AND p.company_id IS NOT NULL THEN RETURN jsonb_build_object('company_id',p.company_id,'status',p.status); END IF;
  IF p.role <> 'operator' OR p.company_id IS NOT NULL THEN RAISE EXCEPTION 'Perfil não pode solicitar vínculo'; END IF;
  SELECT company_id INTO cid FROM public.company_access_codes WHERE code_hash=encode(extensions.digest(upper(trim(company_code)),'sha256'),'hex');
  IF cid IS NULL THEN RAISE EXCEPTION 'Código da empresa inválido'; END IF;
  UPDATE public.profiles SET company_id=cid, role='funcionario', status='pending' WHERE id=uid;
  INSERT INTO public.profile_access_audit(company_id,actor_profile_id,target_profile_id,action) VALUES(cid,uid,uid,'team.register');
  RETURN jsonb_build_object('company_id',cid,'status','pending');
END; $$;

CREATE OR REPLACE FUNCTION public.rotate_company_invite()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE uid uuid := auth.uid(); cid bigint; code text;
BEGIN
  IF NOT public.transport_is_company_admin() THEN RAISE EXCEPTION 'Acesso negado'; END IF;
  cid := public.transport_company_id(); code := upper(substr(encode(extensions.gen_random_bytes(8),'hex'),1,12));
  INSERT INTO public.company_access_codes(company_id,code_hash,rotated_by) VALUES(cid,encode(extensions.digest(code,'sha256'),'hex'),uid)
  ON CONFLICT(company_id) DO UPDATE SET code_hash=excluded.code_hash,created_at=now(),rotated_by=uid;
  INSERT INTO public.profile_access_audit(company_id,actor_profile_id,action) VALUES(cid,uid,'invite.regenerated');
  RETURN jsonb_build_object('code',code);
END; $$;

CREATE OR REPLACE FUNCTION public.transport_create_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE cid bigint;
BEGIN
  IF NEW.email IS NULL THEN RETURN NEW; END IF;
  IF NEW.raw_user_meta_data->>'registration_kind' = 'employee' THEN
    SELECT company_id INTO cid FROM public.company_access_codes
    WHERE code_hash=encode(extensions.digest(upper(trim(COALESCE(NEW.raw_user_meta_data->>'company_code',''))),'sha256'),'hex');
    IF cid IS NULL THEN RAISE EXCEPTION 'Código da empresa inválido'; END IF;
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

COMMIT;

-- Applied 2026-10-22 with explicit authorization after review and private backup.
-- Supabase history version 20261022182759; legacy direct Data API access restricted.
-- Transactional; preserves records, creates no admin accounts, runs no seed.


CREATE OR REPLACE FUNCTION public.transport_is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$ SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'); $$;
REVOKE ALL ON FUNCTION public.transport_is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.transport_is_admin() TO authenticated;

-- Remove recursive and public profile policies; recreate with safe boundaries.
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can read profiles" ON public.profiles;
CREATE POLICY "Read own profile or admin" ON public.profiles FOR SELECT TO authenticated
USING (id = (SELECT auth.uid()) OR (SELECT public.transport_is_admin()));
CREATE POLICY "Admin manages profiles" ON public.profiles FOR ALL TO authenticated
USING ((SELECT public.transport_is_admin())) WITH CHECK ((SELECT public.transport_is_admin()));
CREATE POLICY "Update own profile name" ON public.profiles FOR UPDATE TO authenticated
USING (id = (SELECT auth.uid())) WITH CHECK (id = (SELECT auth.uid()));
-- Column privilege prevents self-escalation through UPDATE, independent of metadata.
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.profiles FROM authenticated;
GRANT SELECT, INSERT, DELETE ON public.profiles TO authenticated;
GRANT UPDATE (name) ON public.profiles TO authenticated;

-- New accounts always receive operator; metadata never grants privileges.
-- Expand email storage to the valid email length without rewriting/truncating values.
ALTER TABLE public.profiles ALTER COLUMN email TYPE varchar(254);
CREATE OR REPLACE FUNCTION public.transport_create_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$ BEGIN
  IF NEW.email IS NULL THEN RETURN NEW; END IF;
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (NEW.id, left(COALESCE(NULLIF(NEW.raw_user_meta_data->>'name', ''), NEW.email, 'Usuário'), 120), NEW.email, 'operator')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.transport_create_profile() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS transport_auth_profile ON auth.users;
CREATE TRIGGER transport_auth_profile AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.transport_create_profile();
-- Backfill only missing profile rows, never overwrite existing roles/names.
INSERT INTO public.profiles (id, name, email, role)
SELECT id, left(COALESCE(NULLIF(raw_user_meta_data->>'name', ''), email, 'Usuário'), 120), email, 'operator'
FROM auth.users WHERE email IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- Unused PHP tables must not remain publicly writable/readable.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pontos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.line_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_audit ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.users, public.employees, public.pontos, public.rate_limits,
  public.line_assignments, public.company_invites, public.access_audit FROM anon, authenticated;

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public sends contact" ON public.contact_messages;
DROP POLICY IF EXISTS "Admin manages contact" ON public.contact_messages;
CREATE POLICY "Public sends contact" ON public.contact_messages FOR INSERT TO anon, authenticated
WITH CHECK (length(trim(nome)) BETWEEN 2 AND 200 AND length(email) BETWEEN 3 AND 254
  AND length(mensagem) BETWEEN 10 AND 5000);
CREATE POLICY "Admin manages contact" ON public.contact_messages FOR ALL TO authenticated
USING ((SELECT public.transport_is_admin())) WITH CHECK ((SELECT public.transport_is_admin()));
REVOKE ALL ON public.contact_messages FROM anon, authenticated;
GRANT INSERT (nome, email, assunto, mensagem) ON public.contact_messages TO anon, authenticated;
GRANT SELECT, DELETE ON public.contact_messages TO authenticated;

-- Preserve published read policies, prevent invisible rows from appearing publicly.
ALTER POLICY "Public can read published linhas" ON public.linhas
USING (publicado = true AND visivel = 1);



-- Validation after authorization: anon cannot SELECT profiles/contact/legacy data;
-- authenticated profile SELECT no longer throws 42P17; operator cannot change role;
-- ten published lines and schedules remain readable; admin CRUD works with RLS.
-- Rollback: use a separately captured schema/privileges backup. Do not disable RLS.



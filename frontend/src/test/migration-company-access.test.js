import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';

const migration = '../supabase/migrations/20261023_restore_company_employee_access.sql';
const isolationMigration = '../supabase/migrations/20261028_isolate_public_company_operations.sql';

test('migração separa catálogo municipal e rotas privadas e publica os RPCs', () => {
  const sql = readFileSync(migration, 'utf8');
  expect(sql).toContain('escopo_acesso');
  expect(sql).toContain('profile_line_assignments');
  expect(sql).toContain('complete_company_registration');
  expect(sql).toContain('request_employee_membership');
  expect(sql).toContain('approve_employee');
  expect(sql).toContain('rotate_company_invite');
  expect(sql).toContain("'empresa_privada'");
  expect(sql).toContain("'catalogo_publico'");
});

test('migração de isolamento expira convites e protege escopo e perfil', () => {
  const sql = readFileSync(isolationMigration, 'utf8');
  expect(sql).toContain('expires_at > now()');
  expect(sql).toContain("NEW.publicado := false");
  expect(sql).toContain('update_own_profile_name');
  expect(sql).toContain('REVOKE UPDATE ON public.profiles FROM authenticated');
  expect(sql).toContain("p.status = 'active'");
  expect(sql).toContain("l.escopo_acesso = 'empresa_privada'");
  expect(sql).toContain("status='rejected'");
});

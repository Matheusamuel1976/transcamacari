import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';

const migration = '../supabase/migrations/20261023_restore_company_employee_access.sql';

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

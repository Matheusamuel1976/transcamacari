-- Restringe os privilégios padrão; as políticas RLS continuam sendo a fronteira
-- para operações administrativas autenticadas.
revoke all on table public.transport_sources from anon, authenticated;
grant select on table public.transport_sources to anon, authenticated;
grant insert, update, delete on table public.transport_sources to authenticated;

revoke all on sequence public.transport_sources_id_seq from anon, authenticated;
grant usage, select on sequence public.transport_sources_id_seq to authenticated;

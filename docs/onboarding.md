# Preparação local

1. Ler AGENTS.md; confirmar Git, branch master e alterações locais. Não tratar main como equivalente.
2. Reutilizar Node/npm e dependências. Quando necessário, npm ci em frontend/, preservando lockfile e versões.
3. Configurar as duas variáveis públicas Supabase descritas no README em frontend/.env. O arquivo existe nesta máquina; validade não auditada. Preservá-lo e não imprimir valores. Configuração ausente pode impedir renderização na criação do cliente.
4. npm run dev em frontend/. Para sessão isolada: npm run dev -- --host 127.0.0.1 --port 3100 --strictPort. Encerrar somente processos próprios.
5. Rodar lint/build conforme quality.md. Navegador local requer autorização. Não enviar cadastros, contatos ou gravações à produção como teste de preparação.

PHP e banco local só ao investigar legado. Não executar SQL nem provisionar administradores ao iniciar o frontend.

## Codex
Configuração local Context7 em ../.codex/config.toml, autorizada pelo usuário, exige confiança do projeto. Preservar configuração global. Nova sessão pode ser necessária após instalação para descoberta de skills/tools. codex mcp list prova registro, não consulta funcional. Evidências: setup.md.

CLAUDE.md não criado: cliente ativo é Codex e usa AGENTS.md. Criar ponte apenas se Claude for efetivamente utilizado.

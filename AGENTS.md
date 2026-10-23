# TransCamaçari — instruções para agentes

## Produto e contexto
- Mobilidade urbana de Camaçari/BA: moradores e visitantes consultam linhas, horários e mapas; contas autenticadas acessam gestão. Escopo: PRODUCT.md.
- Trabalhar em master. Confirmar Git e alterações locais; preservar commits e trabalho preexistente. Não criar branches desnecessárias.
- Stack verificado em 22/10/2026: React 18, Vite 5, JavaScript/JSX, React Router 6, GSAP/ScrollTrigger, Lenis, Leaflet, Supabase JS 2/Auth/PostgreSQL. PHP/PDO legado preservado.
- Arquitetura: docs/architecture.md; dados: docs/MIGRACAO_SUPABASE.md; motion: docs/MOTION.md (histórico); ferramentas e evidências: docs/setup.md.

## Comandos em frontend/
- Instalação quando necessária: npm ci, preservando lockfile.
- Desenvolvimento: npm run dev (porta 3000); em verificação isolada usar porta livre e --strictPort.
- Lint: npm run lint. Débito conhecido em docs/quality.md; não desativar regras para obter verde.
- Build: npm run build (gera dist/, não publica).
- Testes: npm test (Vitest/jsdom, sem navegador ou gravações reais). Typecheck não configurado.
- Backend legado, somente se necessário: composer install em backend/, depois php -S 127.0.0.1:8000 -t public.

## Método
- Ler fluxo e chamadores, definir reprodução e aceite antes de corrigir. Separar fatos, hipóteses e pendências.
- Menor alteração completa, preservando segurança, acessibilidade e contratos. Não migrar para Next.js, TypeScript, Drizzle ou outro stack por sugestão de template.
- Superpowers: diagnóstico/planejamento proporcionais e verificação antes de concluir. Instruções expressas e autorizações existentes prevalecem sobre aprovações repetidas.
- Reutilizar Ponytail full e skills React/Vercel/Supabase disponíveis; não duplicar instalações. Context7: resolver biblioteca/versão e consultar um conceito por vez, sem segredos ou código privado. Se indisponível, usar fontes oficiais e registrar limite.
- RTK sem hook: prefixar apenas comandos suportados; não envolver duas vezes. Saída integral: rtk proxy <comando>.
- Delegar somente quando autorizado e útil, com arquivos e aceite delimitados. Preservar modelo, autenticação e permissões; não criar proxies/orquestradores preventivos.
- Rodar checks pertinentes, revisar diff e atualizar documento responsável. Conclusão e próxima investigação: docs/quality.md.

## Segurança e publicação
- Somente projetos Supabase/Vercel existentes. Não criar infraestrutura, aplicar migrações em produção, fazer push ou deploy sem autorização específica.
- Não apagar PHP até validar substitutos; não reescrever histórico, descartar alterações ou executar ações destrutivas.
- Não expor .env, tokens, senhas ou service_role/secret keys. Apenas URL/chave pública anônima em VITE_*. RLS é a fronteira de autorização; guards de tela não a substituem.
- Identificar dados de exemplo, coordenadas estimadas e rotas OSRM. Não declarar trajetos oficiais sem fonte nem simular rastreamento.
- Configuração global, autenticação, custos, novos serviços e ampliação de permissões exigem autorização específica. Não habilitar danger-full-access ou approval_policy = "never".
- Correções iniciadas por pedido explícito em 22/10/2026. Estado atual, limitações de validação e mudanças de banco ainda não aplicadas: docs/AUDITORIA_CORRECOES_2026-10-22.md. Não confundir testes de componente com validação visual ou persistência real.

// Títulos e variantes de transição por rota. Fonte única — usada pelo
// TransitionProvider (título) e pelos links (variante padrão).
const BASE = 'TransCamaçari';

export const routeMeta = {
  '/': { title: `${BASE} — Caminhos que Conectam`, variant: 'route' },
  '/login': { title: `Entrar — ${BASE}`, variant: 'auth' },
  '/register': { title: `Criar conta — ${BASE}`, variant: 'auth' },
  '/dashboard': { title: `Painel — ${BASE}`, variant: 'context' },
  '/dashboard/linhas': { title: `Linhas — Painel ${BASE}`, variant: 'admin' },
  '/dashboard/funcionarios': {
    title: `Funcionários — Painel ${BASE}`,
    variant: 'admin',
  },
  '/dashboard/mapa': { title: `Mapa — Painel ${BASE}`, variant: 'admin' },
  '/dashboard/configuracoes': {
    title: `Conta — Painel ${BASE}`,
    variant: 'admin',
  },
};

export function metaFor(pathname) {
  return routeMeta[pathname] || { title: BASE, variant: 'route' };
}

export function titleFor(pathname) {
  return metaFor(pathname).title;
}

import { useTransition } from './TransitionContext';

// Link interno com transição. Respeita abrir-em-nova-aba e modificadores.
// Para âncoras da landing, passe hash="mapa" (com ou sem '#').
export function TransitionLink({
  to,
  variant,
  hash,
  replace,
  children,
  onClick,
  ...rest
}) {
  const ctx = useTransition();
  const href = typeof to === 'string' ? to : to?.pathname || '/';
  const handle = (e) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)
      return;
    e.preventDefault();
    if (ctx) ctx.go(to, { variant, hash, replace });
    else window.location.assign(href);
  };
  return (
    <a
      href={hash && href === '/' ? `/#${String(hash).replace(/^#/, '')}` : href}
      onClick={handle}
      {...rest}
    >
      {children}
    </a>
  );
}

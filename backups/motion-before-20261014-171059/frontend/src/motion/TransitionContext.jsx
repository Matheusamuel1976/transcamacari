import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { metaFor, titleFor } from './routeMeta';

const TransitionContext = createContext(null);

export function useTransition() {
  return useContext(TransitionContext);
}

function pathOf(to) {
  if (typeof to === 'string') return to.split('#')[0] || '/';
  return to.pathname || '/';
}

function hashOf(to, explicit) {
  if (explicit) return explicit.startsWith('#') ? explicit : `#${explicit}`;
  if (typeof to === 'string' && to.includes('#')) return `#${to.split('#')[1]}`;
  return null;
}

// Foco no título da nova página (a11y). Não rola a página.
function focusHeading() {
  try {
    const h = document.querySelector('main h1');
    if (!h) return;
    if (!h.hasAttribute('tabindex')) h.setAttribute('tabindex', '-1');
    h.focus({ preventScroll: true });
  } catch {
    /* noop */
  }
}

export function TransitionProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState('idle'); // idle | exit | enter
  const [variant, setVariant] = useState('route');
  const [pendingHash, setPendingHash] = useState(null);
  const busy = useRef(false);
  const watchdog = useRef(0);
  const target = useRef(null);

  const clearWatchdog = () => {
    if (watchdog.current) {
      clearTimeout(watchdog.current);
      watchdog.current = 0;
    }
  };
  useEffect(() => clearWatchdog, []);

  // Título acompanha a rota mesmo em navegações sem transição (POP, guards).
  useEffect(() => {
    document.title = titleFor(location.pathname);
  }, [location.pathname]);

  const settle = useCallback((destPath, hash) => {
    document.title = titleFor(destPath);
    if (!hash) {
      // Foco após a entrada, quando o conteúdo novo já está montado.
      requestAnimationFrame(() => requestAnimationFrame(focusHeading));
    }
  }, []);

  // Chamado pelo overlay ao fim da saída: troca a rota e inicia a entrada.
  const proceed = useCallback(() => {
    const t = target.current;
    if (!t) {
      setPhase('idle');
      busy.current = false;
      return;
    }
    try {
      navigate(t.to, { replace: !!t.replace });
    } catch {
      // Falha de navegação: nunca prender o overlay.
      target.current = null;
      busy.current = false;
      setPhase('idle');
      return;
    }
    setPendingHash(t.hash);
    settle(pathOf(t.to), t.hash);
    setPhase('enter');
  }, [navigate, settle]);

  // Chamado pelo overlay ao fim da entrada.
  const finish = useCallback(() => {
    clearWatchdog();
    target.current = null;
    busy.current = false;
    setPhase('idle');
  }, []);

  // Watchdog: nenhuma transição pode exceder ~2.8s.
  const armWatchdog = useCallback(() => {
    clearWatchdog();
    watchdog.current = setTimeout(() => {
      target.current = null;
      busy.current = false;
      setPhase('idle');
    }, 2800);
  }, []);

  const scrollToHash = useCallback(
    (hash) => {
      const id = String(hash).replace(/^#/, '');
      if (!id) return false;
      const el = document.getElementById(id);
      if (!el) return false;
      try {
        el.scrollIntoView({
          behavior: reduced ? 'auto' : 'smooth',
          block: 'start',
        });
      } catch {
        el.scrollIntoView();
      }
      return true;
    },
    [reduced],
  );

  const go = useCallback(
    (to, opts = {}) => {
      if (busy.current) return;
      const dest = pathOf(to);
      const hash = hashOf(to, opts.hash);
      const samePage = dest === location.pathname;
      // Mesma página + âncora: apenas scroll suave — NUNCA overlay de rota.
      if (samePage && hash) {
        scrollToHash(hash);
        return;
      }
      if (samePage && !hash) return;
      // Qualquer navegação COM âncora: troca de rota imediata, sem overlay,
      // e o ScrollManager rola após a montagem (elemento precisa existir).
      if (hash) {
        try {
          navigate(to, { replace: !!opts.replace });
        } catch {
          /* noop */
        }
        setPendingHash(hash);
        settle(dest, hash);
        return;
      }
      const v = opts.variant || metaFor(dest).variant;
      // Variantes rápidas ou movimento reduzido: navega direto, sem overlay.
      // A entrada do conteúdo é feita pelo AnimatedPage (modo page/content).
      if (reduced || v === 'admin') {
        try {
          navigate(to, { replace: !!opts.replace });
        } catch {
          /* noop */
        }
        setPendingHash(hash);
        settle(dest, hash);
        return;
      }
      busy.current = true;
      target.current = { to, hash, replace: !!opts.replace };
      setVariant(v);
      armWatchdog();
      setPhase('exit');
    },
    [armWatchdog, location.pathname, navigate, reduced, settle],
  );

  const value = {
    phase,
    variant,
    pendingHash,
    setPendingHash,
    go,
    proceed,
    finish,
    clearWatchdog,
  };
  return (
    <TransitionContext.Provider value={value}>
      {children}
    </TransitionContext.Provider>
  );
}

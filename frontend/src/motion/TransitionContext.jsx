import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate } from 'react-router-dom';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { scrollTo } from './scroll';
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

function focusHeading() {
  try {
    const h =
      document.querySelector('main .auth-card h2') ||
      document.querySelector('main h1');
    if (!h) return;
    if (!h.hasAttribute('tabindex')) h.setAttribute('tabindex', '-1');
    h.focus({ preventScroll: true });
  } catch (error) {
    void error;
  }
}

export function TransitionProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState('idle');
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

  useEffect(() => {
    document.title = titleFor(location.pathname);
  }, [location.pathname]);

  const settle = useCallback((destPath, hash) => {
    document.title = titleFor(destPath);
    if (!hash) {
      requestAnimationFrame(() => requestAnimationFrame(focusHeading));
    }
  }, []);

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
      target.current = null;
      busy.current = false;
      setPhase('idle');
      return;
    }
    setPendingHash(t.hash);
    settle(pathOf(t.to), t.hash);
    setPhase('enter');
  }, [navigate, settle]);

  const finish = useCallback(() => {
    clearWatchdog();
    target.current = null;
    busy.current = false;
    setPhase('idle');
  }, []);

  useEffect(() => {
    window.addEventListener('popstate', finish);
    return () => window.removeEventListener('popstate', finish);
  }, [finish]);

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
      scrollTo(el, reduced);
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

      if (samePage && hash) {
        if (location.hash === hash) scrollToHash(hash);
        else navigate({ pathname: dest, hash }, { replace: !!opts.replace });
        return;
      }
      if (samePage && !hash) return;

      if (hash) {
        try {
          navigate({ pathname: dest, hash }, { replace: !!opts.replace });
        } catch (error) {
          void error;
        }
        setPendingHash(hash);
        settle(dest, hash);
        return;
      }
      const authPair =
        ['/login', '/register'].includes(location.pathname) &&
        ['/login', '/register'].includes(dest);
      const v = authPair
        ? 'auth'
        : opts.variant === 'auth'
          ? 'route'
          : opts.variant || metaFor(dest).variant;
      const resolvedVariant = v === 'auth' && !authPair ? 'route' : v;

      if (reduced || v === 'admin') {
        try {
          navigate(to, { replace: !!opts.replace });
        } catch (error) {
          void error;
        }
        setPendingHash(hash);
        settle(dest, hash);
        return;
      }
      busy.current = true;
      target.current = { to, hash, replace: !!opts.replace };
      setVariant(resolvedVariant);
      armWatchdog();
      setPhase('exit');
    },
    [
      armWatchdog,
      location.pathname,
      location.hash,
      navigate,
      reduced,
      settle,
      scrollToHash,
    ],
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

TransitionProvider.propTypes = { children: PropTypes.node.isRequired };

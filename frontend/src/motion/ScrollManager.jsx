import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useLenis } from '../hooks/useLenis';
import { useTransition } from './TransitionContext';
import { scrollTo } from './scroll';

export function ScrollManager() {
  const { key, hash } = useLocation();
  const navigation = useNavigationType();
  const reduced = useReducedMotion();
  const motion = useTransition();
  const positions = useRef(new Map());
  const restoring = useRef(false);
  useLenis();
  useEffect(() => {
    const previous = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    return () => { history.scrollRestoration = previous; };
  }, []);
  useEffect(() => {
    const save = () => { if (!restoring.current) positions.current.set(key, window.scrollY); };
    window.addEventListener('scroll', save, { passive: true });
    return () => window.removeEventListener('scroll', save);
  }, [key]);
  useEffect(() => {
    let frame, timer, cancelled = false, tries = 0;
    const saved = positions.current.get(key);
    restoring.current = true;
    const restore = () => {
      if (cancelled) return;
      // POP restores the user's exact position, even on a hash entry.
      if (navigation === 'POP' && saved !== undefined) scrollTo(saved, true);
      else if (hash) {
        let id; try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
        const target = document.getElementById(id);
        if (!target && tries++ < 40) { timer = setTimeout(restore, 50); return; }
        if (target) scrollTo(target, reduced);
      } else scrollTo(0, true);
      restoring.current = false;
      ScrollTrigger.refresh();
    };
    frame = requestAnimationFrame(restore);
    return () => { cancelled = true; restoring.current = false; cancelAnimationFrame(frame); clearTimeout(timer); };
  }, [key, hash, navigation, reduced]);
  useEffect(() => {
    const anchor = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      const link = event.target.closest('a[href^="#"]');
      if (!link || link.target || link.hasAttribute('download')) return;
      const hash = link.getAttribute('href');
      if (hash.length < 2) return;
      event.preventDefault();
      motion.go(location.pathname, { hash });
    };
    document.addEventListener('click', anchor);
    return () => document.removeEventListener('click', anchor);
  }, [motion.go]);
  return null;
}

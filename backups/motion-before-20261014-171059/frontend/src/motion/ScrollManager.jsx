import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useTransition } from './TransitionContext';

// Política de scroll:
// - rota nova comum: topo (instantâneo, Lenis sincroniza pelo evento);
// - âncora (#seção ou pendente do go()): rola até o elemento;
// - voltar/avançar (POP): restaura a posição salva da rota;
// - mesma rota: não toca no scroll.
export function ScrollManager() {
  const { pathname, hash, key } = useLocation();
  const navType = useNavigationType();
  const reducedMotion = useReducedMotion();
  const ctx = useTransition();
  const positions = useRef({});
  const pending = ctx?.pendingHash;

  // Salva a posição por chave de histórico (para o POP restaurar).
  useEffect(() => {
    let ticking = false;
    const save = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          positions.current[key] = window.scrollY;
          ticking = false;
        });
      }
    };
    window.addEventListener('scroll', save, { passive: true });
    return () => window.removeEventListener('scroll', save);
  }, [key]);

  useEffect(() => {
    const target = hash || pending || '';
    const id = target.replace(/^#/, '');
    requestAnimationFrame(() => {
      try {
        if (id) {
          // Pequena espera: a rota nova precisa montar a seção antes de rolar.
          let tries = 0;
          const attempt = () => {
            const el = document.getElementById(id);
            if (el) {
              try {
                el.scrollIntoView({
                  behavior: reducedMotion ? 'auto' : 'smooth',
                  block: 'start',
                });
              } catch {
                el.scrollIntoView();
              }
            } else if (tries++ < 20) {
              setTimeout(attempt, 100);
            }
          };
          attempt();
        } else if (
          navType === 'POP' &&
          typeof positions.current[key] === 'number'
        ) {
          window.scrollTo({ top: positions.current[key], behavior: 'auto' });
        } else if (navType !== 'POP') {
          window.scrollTo({ top: 0, behavior: 'auto' });
        }
        ScrollTrigger.refresh();
      } catch {
        /* noop */
      }
      ctx?.setPendingHash?.(null);
    });
    // key identifica unicamente cada entrada do histórico.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return null;
}

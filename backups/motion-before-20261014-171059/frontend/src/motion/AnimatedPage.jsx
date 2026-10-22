import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

// Entrada coordenada da página. O conteúdo é VISÍVEL por padrão — a
// animação parte de fromTo com clearProps, então nada fica preso em
// opacity 0 se o GSAP falhar. mode="content" é a entrada rápida e
// discreta das páginas internas do dashboard (sidebar estável).
export function AnimatedPage({ children, mode = 'page' }) {
  const { pathname } = useLocation();
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Layout novo montado: recalcula triggers e revela a página.
    try {
      ScrollTrigger.refresh();
    } catch {
      /* noop */
    }
    if (reduced) return undefined;
    const tweens = [];
    const fallback = setTimeout(() => {
      try {
        gsap.set(el, { clearProps: 'opacity,transform' });
      } catch {
        /* noop */
      }
    }, 1200);
    try {
      tweens.push(
        gsap.fromTo(
          el,
          { opacity: 0, y: mode === 'content' ? 10 : 22 },
          {
            opacity: 1,
            y: 0,
            duration: mode === 'content' ? 0.18 : 0.32,
            ease: 'power2.out',
            clearProps: 'opacity,transform',
            onComplete: () => {
              clearTimeout(fallback);
              try {
                ScrollTrigger.refresh();
              } catch {
                /* noop */
              }
            },
          },
        ),
      );
      // Entrada editorial do título — exceto no hero da landing, que tem
      // timeline própria e conflitaria.
      const h1 = el.querySelector('h1');
      if (h1 && mode === 'page' && !h1.closest('#hero')) {
        tweens.push(
          gsap.fromTo(
            h1,
            { opacity: 0, y: 26 },
            {
              opacity: 1,
              y: 0,
              duration: 0.4,
              delay: 0.08,
              ease: 'power3.out',
              clearProps: 'opacity,transform',
            },
          ),
        );
      }
    } catch {
      clearTimeout(fallback);
    }
    return () => {
      clearTimeout(fallback);
      try {
        tweens.forEach((t) => t?.kill());
      } catch {
        /* noop */
      }
      try {
        gsap.set(el, { clearProps: 'opacity,transform' });
      } catch {
        /* noop */
      }
    };
  }, [pathname, mode, reduced]);

  return (
    <div ref={ref} className={`t-page t-page--${mode}`}>
      {children}
    </div>
  );
}

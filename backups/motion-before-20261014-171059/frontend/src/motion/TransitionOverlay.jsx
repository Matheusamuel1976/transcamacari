import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useTransition } from './TransitionContext';

// Transição Turismo & Logística em 3 momentos:
//  1. SAÍDA — faixa azul-marinho (#1A237E) varre da esquerda para a direita
//     (clip direcional, nunca um flash); a linha de trajeto laranja (#FF6D00)
//     se desenha e os pontos de conexão surgem em sequência.
//  2. CONTINUIDADE — a composição (faixa + trajeto + pontos) atravessa a
//     tela; a rota troca exatamente com a cobertura total, sem tela vazia.
//  3. ENTRADA — a faixa sai pela direita revelando a nova página, que entra
//     de forma coordenada pelo AnimatedPage.
// Total perceptível ≈ 580ms (saída ~200ms + entrada ~380ms).
// Variante 'auth' (login↔cadastro): véu discreto, 150/200ms.
export function TransitionOverlay() {
  const ctx = useTransition();
  const root = useRef(null);
  const reduced = useReducedMotion();
  const phaseRef = useRef(ctx?.phase);
  phaseRef.current = ctx?.phase;

  useEffect(() => {
    if (!ctx || ctx.phase === 'idle' || reduced) return;
    const el = root.current;
    const done = ctx.phase === 'exit' ? ctx.proceed : ctx.finish;
    if (!el) {
      done();
      return;
    }

    const mobile = window.matchMedia('(max-width: 700px)').matches;
    const soft = ctx.variant === 'auth' || mobile;
    let tl = null;
    const fallback = setTimeout(done, 1400);

    try {
      gsap.set(el, { visibility: 'visible' });
      if (ctx.phase === 'exit') {
        tl = gsap.timeline({
          onComplete: () => {
            clearTimeout(fallback);
            done();
          },
        });
        if (soft) {
          tl.fromTo(
            '.t-veil',
            { opacity: 0 },
            { opacity: 1, duration: 0.15, ease: 'power1.out' },
          );
        } else {
          // Momento 1+2: varredura direcional com trajeto e pontos.
          tl.set('.t-band', { clipPath: 'inset(0% 100% 0% 0%)' })
            .set('.t-route path', { strokeDashoffset: 1200, opacity: 1 })
            .set('.t-dot', { scale: 0, opacity: 1 })
            .set('.t-brand', { opacity: 0, y: 14 })
            .to(
              '.t-band',
              {
                clipPath: 'inset(0% 0% 0% 0%)',
                duration: 0.2,
                ease: 'power3.inOut',
              },
              0,
            )
            .to(
              '.t-route path',
              { strokeDashoffset: 0, duration: 0.3, ease: 'power2.inOut' },
              0.02,
            )
            .to(
              '.t-dot',
              {
                scale: 1,
                duration: 0.16,
                ease: 'back.out(2.2)',
                stagger: 0.05,
              },
              0.1,
            )
            .to(
              '.t-brand',
              { opacity: 1, y: 0, duration: 0.16, ease: 'power2.out' },
              0.14,
            );
        }
      } else {
        tl = gsap.timeline({
          onComplete: () => {
            clearTimeout(fallback);
            done();
          },
        });
        if (soft) {
          tl.to('.t-veil', { opacity: 0, duration: 0.2, ease: 'power1.inOut' });
        } else {
          // Momento 3: trajeto se dissolve, faixa revela a página à direita.
          tl.to(
            '.t-route,.t-dot,.t-brand',
            { opacity: 0, duration: 0.1, ease: 'power1.in' },
            0,
          ).to(
            '.t-band',
            {
              clipPath: 'inset(0% 0% 0% 100%)',
              duration: 0.3,
              ease: 'power3.inOut',
            },
            0.04,
          );
        }
      }
    } catch {
      clearTimeout(fallback);
      done();
    }
    return () => {
      clearTimeout(fallback);
      try {
        tl?.kill();
      } catch {
        /* noop */
      }
      try {
        gsap.set('.t-band,.t-veil,.t-route,.t-dot,.t-brand', {
          clearProps: 'all',
        });
        if (phaseRef.current === 'idle' && el) el.style.visibility = '';
      } catch {
        /* noop */
      }
    };
    // proceed/finish são estáveis (useCallback). phase/variant disparam a troca.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx?.phase, ctx?.variant, reduced]);

  if (!ctx || reduced) return null;

  return (
    <div ref={root} className="t-overlay" aria-hidden="true">
      <div className="t-veil" />
      <div className="t-band">
        <svg
          className="t-route"
          viewBox="0 0 1200 460"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M22 380H210C260 380 260 330 310 330H430C490 330 490 230 550 230H660C760 230 730 70 830 70H1160"
            pathLength="1200"
            strokeDasharray="1200"
          />
          <circle cx="22" cy="380" r="8" />
          <circle cx="1160" cy="70" r="8" />
        </svg>
        <span className="t-dot" style={{ left: '8%', top: '82%' }} />
        <span className="t-dot" style={{ left: '36%', top: '66%' }} />
        <span className="t-dot" style={{ left: '88%', top: '15%' }} />
        <p className="t-brand">
          TransCamaçari<span>.</span>
        </p>
      </div>
    </div>
  );
}

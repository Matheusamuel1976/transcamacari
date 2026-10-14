import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function motionOK() {
  return (
    typeof window !== 'undefined' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Reveal seguro: o conteúdo é VISÍVEL por padrão no CSS.
 * A animação usa gsap.from com once:true — se o GSAP/ScrollTrigger
 * falhar, nada foi escondido e a página continua legível.
 * Ao completar, limpa props inline para nunca prender opacity/transform.
 */
export function revealUp(targets, trigger, opts = {}) {
  const els = (Array.isArray(targets) ? targets : [targets]).filter(Boolean);
  if (!els.length || !motionOK() || !trigger) return () => {};
  try {
    const tween = gsap.from(els, {
      y: 36,
      duration: 0.9,
      ease: 'power3.out',
      stagger: opts.stagger ?? 0.09,
      immediateRender: false,
      scrollTrigger: { trigger, start: 'top 88%', once: true },
      onComplete: () =>
        gsap.set(els, { clearProps: 'opacity,visibility,transform' }),
    });
    return () => {
      try {
        tween.scrollTrigger?.kill();
      } catch {
        /* noop */
      }
      try {
        tween.kill();
      } catch {
        /* noop */
      }
      gsap.set(els, { clearProps: 'opacity,visibility,transform' });
    };
  } catch {
    return () => {};
  }
}

/** Parallax simples sem esconder nada (só transform, com clearProps). */
export function parallaxY(target, trigger, yPercent = 12) {
  if (!target || !motionOK() || !trigger) return () => {};
  try {
    const tween = gsap.to(target, {
      yPercent,
      ease: 'none',
      scrollTrigger: {
        trigger,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
    });
    return () => {
      try {
        tween.scrollTrigger?.kill();
      } catch {
        /* noop */
      }
      try {
        tween.kill();
      } catch {
        /* noop */
      }
      try {
        gsap.set(target, { clearProps: 'transform' });
      } catch {
        /* noop */
      }
    };
  } catch {
    return () => {};
  }
}

export function refreshTriggers() {
  try {
    ScrollTrigger.refresh();
  } catch {
    /* noop */
  }
}

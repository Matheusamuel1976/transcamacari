import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function motionOK() {
  return (
    typeof window !== 'undefined' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

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
      } catch {}
      try {
        tween.kill();
      } catch {}
      gsap.set(els, { clearProps: 'opacity,visibility,transform' });
    };
  } catch {
    return () => {};
  }
}

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
      } catch {}
      try {
        tween.kill();
      } catch {}
      try {
        gsap.set(target, { clearProps: 'transform' });
      } catch {}
    };
  } catch {
    return () => {};
  }
}

export function refreshTriggers() {
  try {
    ScrollTrigger.refresh();
  } catch {}
}

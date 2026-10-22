import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';

export function Preloader({ onComplete }) {
  const root = useRef(null);
  const done = useRef(onComplete);
  done.current = onComplete;
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) {
      done.current?.();
      return;
    }
    const fallback = setTimeout(() => done.current?.(), 1500);
    const ctx = gsap.context(() => {
      gsap.to(root.current, {
        yPercent: -100,
        duration: 0.75,
        delay: 0.25,
        ease: 'expo.inOut',
        onComplete: () => done.current?.(),
      });
    }, root);
    return () => {
      clearTimeout(fallback);
      ctx.revert();
    };
  }, [reduced]);
  if (reduced) return null;
  return (
    <div ref={root} className="preloader" aria-hidden="true">
      <span>
        TransCamaçari<span className="preloader__dot">.</span>
      </span>
      <style>{`.preloader{position:fixed;inset:0;background:#1A237E;color:#F5F5F5;z-index:9999;display:grid;place-items:center;font-family:var(--font-display);font-size:clamp(1.5rem,6vw,4rem);pointer-events:none}.preloader__dot{color:#4E59AC}`}</style>
    </div>
  );
}

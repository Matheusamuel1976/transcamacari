import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useTransition } from './TransitionContext';

export function TransitionOverlay() {
  const motion = useTransition();
  const root = useRef(null);
  const reduced = useReducedMotion();
  const { phase, variant, proceed, finish } = motion;
  useLayoutEffect(() => {
    if (phase === 'idle') return;
    const done = phase === 'exit' ? proceed : finish;
    if (reduced) {
      done();
      return;
    }
    const safety = setTimeout(done, 1100);
    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        onComplete: () => {
          clearTimeout(safety);
          done();
        },
      });
      if (variant === 'auth') {
        const card = document.querySelector('.auth-card');
        if (card && phase === 'exit')
          timeline.to(card, {
            x: -14,
            opacity: 0.3,
            duration: 0.16,
            ease: 'power2.in',
          });
        else timeline.to({}, { duration: 0.24 });
        return;
      }
      const band = root.current.querySelector('.t-band');
      const path = root.current.querySelector('.t-route path');
      gsap.set(root.current, { visibility: 'visible' });
      if (phase === 'exit') {
        const content = document.querySelector('.t-page');
        if (content)
          timeline.to(
            content,
            { y: -12, duration: 0.28, ease: 'power2.in' },
            0,
          );
        timeline
          .fromTo(
            band,
            { xPercent: -101 },
            { xPercent: 0, duration: 0.42, ease: 'expo.inOut' },
            0,
          )
          .fromTo(
            path,
            { strokeDashoffset: 1200 },
            { strokeDashoffset: 0, duration: 0.42, ease: 'power2.out' },
            0.1,
          );
      } else {
        timeline.fromTo(
          band,
          { xPercent: 0 },
          { xPercent: 101, duration: 0.48, ease: 'expo.inOut' },
          0,
        );
      }
    });
    return () => {
      clearTimeout(safety);
      context.revert();
    };
  }, [phase, variant, reduced, proceed, finish]);
  return (
    <div ref={root} className="t-overlay" aria-hidden="true">
      <div className="t-band">
        <svg className="t-route" viewBox="0 0 1200 460" fill="none">
          <path
            d="M22 380H210C260 380 260 330 310 330H430C490 330 490 230 550 230H660C760 230 730 70 830 70H1160"
            pathLength="1200"
            strokeDasharray="1200"
          />
        </svg>
        <p className="t-brand">
          TransCamaçari<span>.</span>
        </p>
      </div>
    </div>
  );
}

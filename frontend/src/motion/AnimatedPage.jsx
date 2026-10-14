import { useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useTransition } from './TransitionContext';

export function AnimatedPage({ children, mode = 'page' }) {
  const { pathname } = useLocation();
  const root = useRef(null);
  const reduced = useReducedMotion();
  const motion = useTransition();
  useLayoutEffect(() => {
    if (reduced || pathname === '/') return;
    const context = gsap.context(() => {
      const card = root.current.querySelector('.auth-card');
      const targets = card
        ? Array.from(card.children)
        : Array.from(root.current.children);
      gsap.from(targets, {
        y: mode === 'content' ? 8 : 18,
        opacity: 0,
        duration: mode === 'content' ? 0.2 : 0.42,
        stagger: mode === 'content' ? 0 : 0.035,
        delay: motion.variant === 'auth' ? 0 : 0.12,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      });
      if (card && motion.variant !== 'auth')
        gsap.from('.auth-visual', {
          y: 16,
          duration: 0.6,
          ease: 'expo.out',
          clearProps: 'transform',
        });
    }, root);
    return () => context.revert();
  }, [pathname, mode, reduced]);
  return (
    <div ref={root} className={`t-page t-page--${mode}`}>
      {children}
    </div>
  );
}

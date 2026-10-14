import { useEffect } from 'react';
import { gsap } from 'gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';

export function useChapterMotion(root) {
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    const context = gsap.context(() => {
      const reveal = (selector, trigger, props) => {
        const elements = root.current.querySelectorAll(selector);
        if (!elements.length) return;
        gsap.from(elements, {
          duration: 0.65,
          ease: 'expo.out',
          immediateRender: false,
          clearProps: 'transform,opacity,clipPath',
          ...props,
          scrollTrigger: { trigger, start: 'top 88%', once: true },
        });
      };
      reveal('.line-finder__search', '#descubra', {
        clipPath: 'inset(0 8% 0 0)',
        y: 14,
      });
      reveal('.territory-map__heading > *', '#mapa', { y: 18, stagger: 0.09 });
      reveal('.territory-map__sidebar > *', '.territory-map__workspace', {
        x: -12,
        stagger: 0.04,
      });
      reveal('.tech-stack li', '.tech-stack', { y: 18, stagger: 0.045 });
      reveal('.project-team > *', '#equipe', { y: 24, stagger: 0.12 });
      reveal('.footer__name', '.footer__body', {
        clipPath: 'inset(0 0 22% 0)',
        y: 12,
        duration: 0.9,
      });
    }, root);
    return () => context.revert();
  }, [root, reduced]);
}

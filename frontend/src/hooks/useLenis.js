import { useEffect, useRef, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from './useReducedMotion';
import { setScroller } from '../motion/scroll';

export function useLenis() {
  const lenisRef = useRef(null);
  const [lenis, setLenis] = useState(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    let mounted = true;
    let frame = 0;
    if (
      reducedMotion || window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setLenis(null);
      return;
    }

    import('lenis')
      .then(({ default: Lenis }) => {
        if (!mounted) return;

        const lenisInstance = new Lenis({
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          direction: 'vertical',
          gestureDirection: 'vertical',
          smooth: true,
          smoothTouch: false,
          touchMultiplier: 2,
        });

        lenisRef.current = lenisInstance;
        setScroller(lenisInstance);
        lenisInstance.on('scroll', ScrollTrigger.update);
        setLenis(lenisInstance);

        function raf(time) {
          lenisInstance.raf(time);
          frame = requestAnimationFrame(raf);
        }
        frame = requestAnimationFrame(raf);
      })
      .catch(() => {});

    return () => {
      mounted = false;
      cancelAnimationFrame(frame);
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
        setScroller(null);
      }
    };
  }, [reducedMotion]);

  return lenis;
}

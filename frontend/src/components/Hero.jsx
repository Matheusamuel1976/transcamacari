import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import Magnet from './reactbits/Magnet/Magnet';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useTransition } from '../motion/TransitionContext';
import '../styles/hero.css';

gsap.registerPlugin(ScrollTrigger);

export function Hero() {
  const root = useRef(null);
  const reducedMotion = useReducedMotion();
  const motion = useTransition();
  useLayoutEffect(() => {
    if (reducedMotion || window.location.hash) return;
    const ctx = gsap.context(() => {
      const navbar = document.querySelector('.navbar');
      const intro = gsap.timeline({ defaults: { ease: 'expo.out', clearProps: 'transform,opacity,clipPath' } });
      intro.from('.hero__photo', { clipPath: 'inset(12% 14% 12% 14%)', duration: 1.25 }, 0)
        .from('.hero__photo img', { scale: 1.12, duration: 1.4 }, 0)
        .from('.hero__word', { yPercent: 108, rotate: 2, duration: 1.05 }, 0.08)
        .from('.hero__script', { clipPath: 'inset(0 100% 0 0)', x: 24, duration: 1.1 }, 0.26)
        .from('.hero__manifesto, .hero__description', { y: 24, opacity: 0, stagger: 0.08, duration: 0.65 }, 0.34)
        .from('.hero__map-link, .hero__explore, .hero__action', { y: 16, opacity: 0, stagger: 0.06, duration: 0.5 }, 0.48)
        .from('.hero__masthead, .hero__colophon', { opacity: 0, duration: 0.5 }, 0.48)
        .from('.hero__route path', { strokeDashoffset: 1200, duration: 1.15, clearProps: 'strokeDashoffset' }, 0.3);
      if (navbar) intro.from(navbar, { y: -18, opacity: 0, duration: 0.6 }, 0.12);
      if (window.matchMedia('(min-width: 900px) and (pointer: fine)').matches) {
        gsap.to('.hero__photo img', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.6 } });
      }
    }, root);
    return () => ctx.revert();
  }, [reducedMotion]);
  const explore = () => motion.go('/', { hash: 'cidade' });
  return (
    <section ref={root} id="hero" className="hero" aria-labelledby="hero-title">
      <div className="hero__masthead">
        <span>Bahia, Brasil</span>
        <span>Mobilidade que aproxima.</span>
      </div>
      <h1 id="hero-title" className="hero__title">
        <span className="hero__word">CAMAÇARI</span>
        <span className="sr-only"> — Caminhos que conectam</span>
      </h1>
      <div className="hero__story">
        <div className="hero__aside">
          <p className="hero__manifesto">
            Caminhos
            <br />
            que conectam.
          </p>
          <p className="hero__description">
            Entre a casa e o trabalho.
            <br />
            Entre a cidade e o mar.
            <br />
            Um lugar, muitos destinos.
          </p>
          <a className="hero__map-link" href="#mapa">
            Explorar o mapa <ArrowUpRight size={19} />
          </a>
          <button className="hero__explore" onClick={explore}>
            <ArrowDown size={19} />
            <span>Conheça o território</span>
          </button>
        </div>
        <figure className="hero__photo">
          <img
            src="/assets/images/camacari-gilclei.jpg"
            alt="Ônibus e tráfego em uma rua de Camaçari ao entardecer, fotografados em 2007"
            width="1024"
            height="768"
            fetchpriority="high"
          />
          <figcaption>
            O cotidiano em movimento. <span>Camaçari · arquivo, 2007</span>
          </figcaption>
        </figure>
        <p className="hero__script" aria-hidden="true">
          em movimento.
        </p>
        <svg
          className="hero__route"
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
        <div className="hero__action">
          <Magnet
            padding={35}
            magnetStrength={6}
            maxOffset={7}
            disabled={reducedMotion}
          >
            <a href="#descubra" className="hero__find">
              <ArrowUpRight size={28} />
              <span>
                Encontre
                <br />
                sua linha
              </span>
            </a>
          </Magnet>
        </div>
      </div>
      <div className="hero__colophon">
        <span>SEDE / BAIRROS / ORLA</span>
        <p>A cidade se encontra no caminho.</p>
        <a href="#contato">
          Vamos conversar <ArrowUpRight size={14} />
        </a>
      </div>
    </section>
  );
}

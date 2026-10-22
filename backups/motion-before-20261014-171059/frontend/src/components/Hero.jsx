import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import Magnet from './reactbits/Magnet/Magnet';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useLenis } from '../hooks/useLenis';
import '../styles/hero.css';

gsap.registerPlugin(ScrollTrigger);

export function Hero() {
  const root = useRef(null);
  const reducedMotion = useReducedMotion();
  const lenis = useLenis();
  useEffect(() => {
    if (reducedMotion) return;
    const safety = setTimeout(() => {
      const nodes = root.current;
      if (!nodes) return;
      gsap.set(nodes.querySelector('.hero__word'), { clearProps: 'transform' });
      gsap.set(nodes.querySelector('.hero__photo'), { clearProps: 'clipPath' });
    }, 3500);
    const ctx = gsap.context(() => {
      // Copy and actions stay visible; the entrance animates geometry only.
      gsap
        .timeline({ delay: 0.85, defaults: { ease: 'expo.out' } })
        .from('.hero__word', { yPercent: 85, duration: 1.45 })
        .from(
          '.hero__photo',
          { clipPath: 'inset(0 0 100% 0)', duration: 1.65 },
          0.12,
        )
        .from('.hero__photo img', { scale: 1.16, duration: 1.8 }, 0.12)
        .from('.hero__script', { x: 55, duration: 1.2 }, 0.3)
        .from(
          '.hero__route path',
          { strokeDashoffset: 1200, duration: 1.8 },
          0.45,
        );
      gsap.to('.hero__photo img', {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.7,
        },
      });
      gsap.to('.hero__script', {
        xPercent: -9,
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.7,
        },
      });
    }, root);
    return () => {
      clearTimeout(safety);
      ctx.revert();
    };
  }, [reducedMotion]);
  const explore = () => {
    const next = document.getElementById('cidade');
    if (lenis) lenis.scrollTo(next, { offset: -80 });
    else next?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
  };
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

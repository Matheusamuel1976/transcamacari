import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ArrowUpRight } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const journeys = [
  {
    name: 'Sair de casa',
    title: 'Todo caminho tem um começo.',
    text: 'Procure pelo seu bairro, pelo nome da linha ou pelo destino. O primeiro passo é saber quais conexões estão cadastradas.',
  },
  {
    name: 'Atravessar a cidade',
    title: 'Seu trajeto, com mais contexto.',
    text: 'Consulte a origem, o destino e os horários informados pela empresa. Veja os pontos cadastrados no mapa.',
  },
  {
    name: 'Encontrar seu lugar',
    title: 'Chegar também é se conectar.',
    text: 'Do cotidiano aos encontros na orla, explore o território e planeje seu deslocamento com as informações disponíveis.',
  },
];

export function ChapterCaminhos() {
  const root = useRef(null);
  const touchX = useRef(null);
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const step = (dir) =>
    setActive((a) => (a + dir + journeys.length) % journeys.length);
  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.journey__path',
        { strokeDashoffset: 1000 },
        {
          strokeDashoffset: 0,
          immediateRender: false,
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top 80%',
            end: 'bottom 35%',
            scrub: 0.8,
          },
        },
      );
      gsap.to('.journey__orb', {
        xPercent: 25,
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }, root);
    return () => ctx.revert();
  }, [reduced]);
  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => { gsap.from('.journey__panel > *', { x: 14, opacity: 0.35, stagger: 0.045, duration: 0.35, ease: 'power3.out', clearProps: 'transform,opacity' }); }, root);
    return () => ctx.revert();
  }, [active, reduced]);
  return (
    <section
      ref={root}
      id="caminhos"
      className="journey"
      aria-labelledby="caminhos-title"
    >
      <div className="journey__heading">
        <h2 id="caminhos-title">
          A vida acontece
          <br />
          <em>entre destinos.</em>
        </h2>
        <p>
          Os caminhos do cotidiano
          <br />
          desenham a nossa cidade.
        </p>
      </div>
      <div className="journey__graphic" aria-hidden="true">
        <svg viewBox="0 0 1100 180" fill="none">
          <path
            className="journey__path"
            d="M30 130H260C370 130 330 45 440 45H650C760 45 730 130 840 130H1070"
            pathLength="1000"
            strokeDasharray="1000"
          />
          <circle cx="30" cy="130" r="9" />
          <circle cx="550" cy="45" r="9" />
          <circle cx="1070" cy="130" r="9" />
        </svg>
        <span className="journey__orb" />
      </div>
      <div
        className="journey__tabs"
        role="tablist"
        aria-label="Etapas do deslocamento"
      >
        {journeys.map((item, i) => (
          <button
            key={item.name}
            id={`journey-tab-${i}`}
            role="tab"
            aria-selected={active === i}
            aria-controls="journey-panel"
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => {
              if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
                e.preventDefault();
                const next =
                  e.key === 'Home'
                    ? 0
                    : e.key === 'End'
                      ? 2
                      : (i + (e.key === 'ArrowRight' ? 1 : 2)) % 3;
                setActive(next);
                document.getElementById(`journey-tab-${next}`)?.focus();
              }
            }}
          >
            {item.name}
            <ArrowUpRight size={18} />
          </button>
        ))}
      </div>
      <div
        id="journey-panel"
        className="journey__panel"
        role="tabpanel"
        aria-labelledby={`journey-tab-${active}`}
        tabIndex={0}
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchX.current == null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) > 48) step(dx < 0 ? 1 : -1);
        }}
      >
        <h3>{journeys[active].title}</h3>
        <p>{journeys[active].text}</p>
        <a href="#descubra">
          Consultar linhas <ArrowUpRight size={18} />
        </a>
      </div>
    </section>
  );
}

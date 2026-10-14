import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

// Fotografias de arquivo já creditadas em SOURCES.md e no footer.
// Nenhuma imagem estrangeira ou gerada é apresentada como Camaçari.
const photos = [
  {
    src: '/assets/images/camacari-gilclei.jpg',
    alt: 'Ônibus e tráfego em uma rua de Camaçari ao entardecer, fotografados em 2007',
    caption: 'O cotidiano em movimento.',
    credit: 'Gilclei · Camaçari, 2007 · uso livre',
  },
  {
    src: '/assets/images/arembepe-barreto.jpg',
    alt: 'Mar e recifes de Arembepe, em Camaçari, fotografados em 2015',
    caption: 'Da sede à orla.',
    credit: 'Barreto, L. A. · Arembepe, 2015 · CC BY-SA 4.0',
  },
];

export function ChapterCidade() {
  const root = useRef(null);
  const track = useRef(null);
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const go = useCallback(
    (next) => {
      const el = track.current;
      if (!el) return;
      const clamped = Math.max(0, Math.min(photos.length - 1, next));
      el.scrollTo({
        left: clamped * el.clientWidth,
        behavior: reduced ? 'auto' : 'smooth',
      });
      setIndex(clamped);
    },
    [reduced],
  );
  const onScroll = () => {
    const el = track.current;
    if (!el || !el.clientWidth) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  };
  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(index + 1);
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(index - 1);
    }
  };
  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.from('.territory__photo', { clipPath: 'inset(0 0 18% 0)', duration: 1, ease: 'expo.out', immediateRender: false, clearProps: 'clipPath', scrollTrigger: { trigger: '.territory__spread', start: 'top 85%', once: true } });
      gsap.from('.territory__intro > *', { y: 24, stagger: 0.1, duration: 0.7, immediateRender: false, clearProps: 'transform', scrollTrigger: { trigger: root.current, start: 'top 85%', once: true } });
      gsap.to('.territory__photo img', {
        yPercent: 10,
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8,
        },
      });
      gsap.from('.territory__statement', {
        y: 30,
        immediateRender: false,
        duration: 1.1,
        ease: 'expo.out',
        scrollTrigger: { trigger: root.current, start: 'top 75%', once: true },
      });
    }, root);
    return () => ctx.revert();
  }, [reduced]);
  return (
    <section
      ref={root}
      id="cidade"
      className="territory"
      aria-labelledby="cidade-title"
    >
      <div className="territory__intro">
        <h2 id="cidade-title">
          Uma cidade.
          <br />
          <em>Muitos encontros.</em>
        </h2>
        <p>
          Camaçari é feita de quem sai cedo, de quem volta para casa, de quem
          atravessa um bairro para encontrar o outro. O transporte conecta essas
          histórias.
        </p>
      </div>
      <div className="territory__spread">
        <figure className="territory__photo">
          <img
            src="/assets/images/arembepe-barreto.jpg"
            alt="Mar e recifes de Arembepe, em Camaçari, fotografados em 2015"
            loading="lazy"
            width="3264"
            height="1836"
          />
          <figcaption>Arembepe · arquivo, 2015</figcaption>
        </figure>
        <div className="territory__statement">
          <span className="territory__place">Da sede à orla.</span>
          <p>
            Não é só chegar.
            <br />É fazer parte
            <br />
            <em>do caminho.</em>
          </p>
          <a href="#descubra">
            Encontre sua conexão <ArrowUpRight size={22} />
          </a>
          <small>Fotografia: Barreto, L. A. · CC BY-SA 4.0</small>
        </div>
      </div>
      <div
        className="territory__gallery"
        role="region"
        aria-roledescription="carrossel"
        aria-label="Camaçari em imagens de arquivo"
        onKeyDown={onKeyDown}
        tabIndex={0}
      >
        <div className="territory__track" ref={track} onScroll={onScroll}>
          {photos.map((p, i) => (
            <figure
              key={p.src}
              className="territory__slide"
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} de ${photos.length}`}
            >
              <img src={p.src} alt={p.alt} loading="lazy" draggable={false} />
              <figcaption>
                <strong>{p.caption}</strong>
                <span>{p.credit}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="territory__gallery-bar">
          <p aria-live="polite">
            {String(index + 1).padStart(2, '0')} /{' '}
            {String(photos.length).padStart(2, '0')}
          </p>
          <div>
            <button
              onClick={() => go(index - 1)}
              disabled={index === 0}
              aria-label="Imagem anterior"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              onClick={() => go(index + 1)}
              disabled={index === photos.length - 1}
              aria-label="Próxima imagem"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
      <div className="territory__places">
        <span>Centro</span>
        <span>Vila de Abrantes</span>
        <span>Jauá</span>
        <span>Arembepe</span>
        <span>Guarajuba</span>
      </div>
    </section>
  );
}

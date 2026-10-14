import { ArrowUpRight, MapPin, Clock, ShieldCheck } from 'lucide-react';

const stack = [
  ['React 18', 'Interface e rotas'],
  ['Vite 5', 'Build e desenvolvimento'],
  ['React Router 6', 'Navegação'],
  ['Leaflet + OpenStreetMap', 'Mapa interativo'],
  ['GSAP + ScrollTrigger', 'Movimento e reveals'],
  ['Lenis', 'Rolagem suave'],
  ['PHP 8.3 MVC', 'API e regras de negócio'],
  ['MySQL + PDO', 'Persistência'],
  ['PHPMailer', 'Contato via SMTP'],
  ['Lucide', 'Iconografia'],
];

export function ChapterTecnologia() {
  return (
    <section
      id="tecnologia"
      className="mobility-info"
      aria-labelledby="tec-title"
    >
      <h2 id="tec-title">
        Informação clara.
        <br />
        <em>Mais autonomia.</em>
      </h2>
      <div className="mobility-info__rows">
        <article>
          <Clock size={23} />
          <div>
            <h3>Planeje seu deslocamento</h3>
            <p>
              Consulte os horários informados pelas empresas. Confirme
              alterações de operação diretamente com o responsável pela linha.
            </p>
          </div>
        </article>
        <article>
          <MapPin size={23} />
          <div>
            <h3>Entenda o percurso</h3>
            <p>
              O mapa conecta os pontos cadastrados. As linhas tracejadas são
              conexões visuais, sem cálculo de rota viária ou rastreamento de
              ônibus.
            </p>
          </div>
        </article>
        <article>
          <ShieldCheck size={23} />
          <div>
            <h3>Sua localização, sua escolha</h3>
            <p>
              A posição aparece somente quando você solicita e autoriza o
              navegador. Você pode explorar o mapa sem compartilhar sua
              localização.
            </p>
          </div>
        </article>
        <a href="#mapa">
          Explore com mais contexto <ArrowUpRight size={20} />
        </a>
      </div>
      <div className="tech-stack" aria-label="Tecnologias utilizadas">
        <h3>Construído com as ferramentas certas.</h3>
        <ul>
          {stack.map(([name, role], i) => (
            <li key={name}>
              <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <strong>{name}</strong>
              <small>{role}</small>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

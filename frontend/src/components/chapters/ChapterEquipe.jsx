import { ArrowUpRight } from 'lucide-react';

const team = [
  { name: 'Keyla Nogueira', photo: '/assets/images/team/integrante-02.png' },
  { name: 'Leandro', photo: '/assets/images/team/integrante-01.png' },
  { name: 'Eduardo', photo: '/assets/images/team/integrante-04.png' },
  { name: 'Matheus Jacinto', photo: '/assets/images/team/integrante-03.png' },
  { name: 'Thairan', photo: '/assets/images/team/integrante-05.png' },
];

export function ChapterEquipe() {
  return (
    <section id="equipe" className="project-team" aria-labelledby="team-title">
      <div>
        <h2 id="team-title">
          Feito para conectar
          <br />
          <em>pessoas e lugares.</em>
        </h2>
        <p>
          O TransCamaçari reúne consulta de linhas, mapas e gerenciamento em uma
          experiência dedicada à mobilidade de Camaçari.
        </p>
        <a className="project-team__cta" href="#desenvolvedores">
          Conheça os desenvolvedores <ArrowUpRight size={20} />
        </a>
      </div>
      <div className="project-team__note" id="desenvolvedores" tabIndex={-1}>
        <h3>Sobre o projeto</h3>
        <p>
          Conheça a equipe que transformou pesquisa, tecnologia e mobilidade
          urbana nesta experiência para Camaçari.
        </p>
        <a href="#contato">
          Fale com a equipe <ArrowUpRight size={20} />
        </a>
      </div>
      <ul className="team-grid" aria-label="Desenvolvedores">
        {team.map((m) => (
          <li key={m.name} className="team-card">
            <div className="team-photo">
              <img
                src={m.photo}
                alt={`Retrato de ${m.name}`}
                loading="lazy"
                decoding="async"
              />
            </div>
            <p className="team-name">{m.name}</p>
            <p className="team-role">Equipe TransCamaçari</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

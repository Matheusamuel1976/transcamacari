import { ArrowUpRight, ImagePlus } from 'lucide-react';

const team = [
  { name: 'Keyla Nogueira', initials: 'KN' },
  { name: 'Leandro', initials: 'LE' },
  { name: 'Eduardo', initials: 'ED' },
  { name: 'Matheus Jacinto', initials: 'MJ' },
  { name: 'Thairan', initials: 'TH' },
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
          As fotografias da equipe entram aqui em breve — nenhuma imagem é
          exibida sem autorização.
        </p>
        <a href="#contato">
          Fale com a equipe <ArrowUpRight size={20} />
        </a>
      </div>
      <ul className="team-grid" aria-label="Desenvolvedores">
        {team.map((m) => (
          <li key={m.name} className="team-card">
            <div
              className="team-photo"
              role="img"
              aria-label={`Fotografia de ${m.name} em breve`}
            >
              <span aria-hidden="true">{m.initials}</span>
              <span className="team-photo__hint">
                <ImagePlus size={16} /> foto em breve
              </span>
            </div>
            <p className="team-name">{m.name}</p>
            <p className="team-role">Equipe TransCamaçari</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

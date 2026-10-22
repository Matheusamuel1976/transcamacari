import { ArrowUpRight } from 'lucide-react';

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
          Os nomes, as funções e as fotografias dos desenvolvedores ainda não
          foram informados. Este espaço será atualizado com os dados confirmados
          da equipe — nenhuma informação é exibida sem autorização.
        </p>
        <a href="#contato">
          Fale com a equipe <ArrowUpRight size={20} />
        </a>
      </div>
    </section>
  );
}

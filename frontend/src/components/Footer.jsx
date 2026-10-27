import { ArrowUpRight } from 'lucide-react';
import { TransitionLink } from '../motion/TransitionLink';
import { ChapterContato } from './chapters/ChapterContato';

export function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <ChapterContato />
      <div className="footer__body">
        <div className="footer__top">
          <p>
            Uma cidade inteira.
            <br />
            Um caminho de cada vez.
          </p>
          <a href="#hero" aria-label="Voltar ao início">
            <ArrowUpRight size={30} />
          </a>
        </div>
        <p className="footer__name">
          TransCamaçari<span>.</span>
        </p>
        <nav className="footer__nav" aria-label="Mapa do site">
          <TransitionLink to="/" hash="cidade">
            A cidade
          </TransitionLink>
          <TransitionLink to="/" hash="descubra">
            Linhas
          </TransitionLink>
          <TransitionLink to="/" hash="mapa">
            Mapa
          </TransitionLink>
          <TransitionLink to="/" hash="equipe">
            Equipe
          </TransitionLink>
          <TransitionLink to="/login" variant="auth">
            Gerenciamento
          </TransitionLink>
        </nav>
        <div className="footer__credits">
          <p>
            Fotografias de arquivo:{' '}
            <a
              href="https://commons.wikimedia.org/wiki/File:Camacari.jpg"
              target="_blank"
              rel="noreferrer"
            >
              Gilclei · Camaçari, 2007
            </a>{' '}
            (uso livre, conforme fonte) e{' '}
            <a
              href="https://commons.wikimedia.org/wiki/File:Arembepe,_Camacari-_BA.jpg"
              target="_blank"
              rel="noreferrer"
            >
              Barreto, L. A. · Arembepe, 2015
            </a>
            ,{' '}
            <a
              href="https://creativecommons.org/licenses/by-sa/4.0/"
              target="_blank"
              rel="noreferrer"
            >
              CC BY-SA 4.0
            </a>
            . Exibição com recorte; adaptações sob a mesma licença.
          </p>
          <p>
            Exemplos identificados são fictícios e não devem orientar viagens.
            Mapa © OpenStreetMap contributors.
          </p>
        </div>
      </div>
      <style>{`.footer{background:var(--color-petroleum-dark);color:var(--color-ivory);padding:0}.footer__body{padding:50px 5vw 35px}.footer__top{display:flex;justify-content:space-between;align-items:center;font-size:20px;line-height:1.3}.footer__top>a{display:grid;place-items:center;width:65px;height:65px;border:1px solid var(--color-footer-muted);color:var(--color-footer-muted);border-radius:50%}.footer__top>a:hover{background:var(--color-petroleum);color:var(--color-white)}.footer__name{font-size:clamp(2rem,10vw,10rem);font-family:var(--font-display);letter-spacing:-.04em;line-height:1.15;margin:45px 0}.footer__name>span{color:var(--color-petroleum-light)}.footer__nav{display:flex;gap:30px;border-top:1px solid var(--color-petroleum-light);border-bottom:1px solid var(--color-petroleum-light);padding:10px 0;font-size:13px}.footer__nav a{display:inline-flex;align-items:center;min-height:44px}.footer__credits{font-size:12px;color:var(--color-footer-muted);line-height:1.8;margin-top:24px;display:grid;grid-template-columns:1.4fr 1fr;gap:10%}.footer__credits a{text-decoration:underline;text-underline-offset:3px}@media(max-width:600px){.footer__body{padding:35px 20px}.footer__top{font-size:17px}.footer__name{font-size:10vw;margin:35px 0}.footer__nav{gap:18px;flex-wrap:wrap;font-size:12px}.footer__credits{grid-template-columns:1fr;gap:15px}}`}</style>
    </footer>
  );
}

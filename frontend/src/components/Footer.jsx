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
      <style>{`.footer{background:#12175C;color:#F5F5F5;padding:0}.footer__body{padding:50px 5vw 35px}.footer__top{display:flex;justify-content:space-between;align-items:center;font-size:20px;line-height:1.3}.footer__top>a{display:grid;place-items:center;width:65px;height:65px;border:1px solid #FF6D00;color:#FF6D00;border-radius:50%}.footer__name{font-size:clamp(2rem,10vw,10rem);font-family:var(--font-display);letter-spacing:-.04em;line-height:1.15;margin:45px 0}.footer__name>span{color:#FF6D00}.footer__nav{display:flex;gap:30px;border-top:1px solid #4E59AC;border-bottom:1px solid #4E59AC;padding:22px 0;font-size:13px}.footer__credits{font-size:10px;color:#C9D2E8;line-height:1.8;margin-top:24px;display:grid;grid-template-columns:1.4fr 1fr;gap:10%}.footer__credits a{text-decoration:underline}@media(max-width:600px){.footer__body{padding:35px 20px}.footer__top{font-size:17px}.footer__name{font-size:10vw;margin:35px 0}.footer__nav{gap:18px;flex-wrap:wrap;font-size:11px}.footer__credits{grid-template-columns:1fr;gap:15px}}`}</style>
    </footer>
  );
}

import { Hero } from '../components/Hero';
import { ChapterCidade } from '../components/chapters/ChapterCidade';
import { ChapterCaminhos } from '../components/chapters/ChapterCaminhos';
import { ChapterDescubra } from '../components/chapters/ChapterDescubra';
import { ChapterMapa } from '../components/chapters/ChapterMapa';
import { ChapterTecnologia } from '../components/chapters/ChapterTecnologia';
import { ChapterEquipe } from '../components/chapters/ChapterEquipe';
import { Footer } from '../components/Footer';

export function LandingPage() {
  return (
    <>
      <Hero />
      <ChapterCidade />
      <ChapterCaminhos />
      <ChapterDescubra />
      <ChapterMapa />
      <ChapterTecnologia />
      <ChapterEquipe />
      <Footer />
    </>
  );
}

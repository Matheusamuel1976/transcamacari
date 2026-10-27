import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, test } from 'vitest';
import { ChapterEquipe } from '../components/chapters/ChapterEquipe';

test('associa as cinco fotografias aos integrantes na sequência informada', async () => {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);

  await act(async () => root.render(<ChapterEquipe />));

  const photos = Array.from(container.querySelectorAll('.team-photo img'));
  expect(photos.map(photo => new URL(photo.src).pathname)).toEqual([
    '/assets/images/team/integrante-01.png',
    '/assets/images/team/integrante-02.png',
    '/assets/images/team/integrante-03.png',
    '/assets/images/team/integrante-04.png',
    '/assets/images/team/integrante-05.png',
  ]);
  expect(photos.map(photo => photo.alt)).toEqual([
    'Retrato de Keyla Nogueira',
    'Retrato de Leandro',
    'Retrato de Eduardo',
    'Retrato de Matheus Jacinto',
    'Retrato de Thairan',
  ]);

  await act(async () => root.unmount());
  container.remove();
});

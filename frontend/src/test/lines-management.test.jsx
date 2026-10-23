import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, test, vi } from 'vitest';
import { LinesManagement } from '../pages/dashboard/LinesManagement';

const service = vi.hoisted(() => ({
  listAll: vi.fn(async () => ({
    data: [
      {
        id: 8,
        codigo: 'S01',
        nome: 'Centro',
        bairro: 'Centro',
        origem: 'A',
        destino: 'B',
        categoria: 'sede',
        visivel: true,
        publicado: true,
      },
    ],
  })),
  update: vi.fn(async () => ({ data: { id: 8 } })),
  schedules: vi.fn(async () => ({
    data: [{ id: 91, categoria: 'uteis', horario: '05:00' }],
  })),
  removeSchedule: vi.fn(async () => ({ success: true })),
  createSchedule: vi.fn(async () => ({ data: { id: 92 } })),
}));

vi.mock('../services/api', () => ({
  api: {
    lines: {
      listAll: service.listAll,
      update: service.update,
      create: vi.fn(),
      remove: vi.fn(),
    },
    horarios: {
      list: service.schedules,
      remove: service.removeSchedule,
      create: service.createSchedule,
    },
  },
}));

let root;
let container;

afterEach(async () => {
  if (root) await act(async () => root.unmount());
  container?.remove();
  vi.clearAllMocks();
});

test('editar linha remove horários existentes e grava usando o ID da linha', async () => {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(<LinesManagement />));
  await act(async () => Promise.resolve());

  await act(async () => container.querySelector('button[aria-label="Editar"]').click());
  await act(async () => Promise.resolve());
  await act(async () =>
    container
      .querySelector('form')
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })),
  );

  expect(service.removeSchedule).toHaveBeenCalledWith(91);
  expect(service.createSchedule).toHaveBeenCalledWith(
    expect.objectContaining({ linha_id: 8, horario: '05:00' }),
  );
});

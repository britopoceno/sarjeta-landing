// Mesma data-limite usada no frontend (src/Jornada.tsx): 09/07 às 18h de Brasília
export const ENCERRAMENTO = new Date('2026-07-09T21:00:00Z');

export const GRUPO_WHATSAPP = 'https://chat.whatsapp.com/HZIadpy45DQKnRqu8dAuEZ';

export const EVENTO = {
  nome: 'Jornada de Produção Musical',
  local: 'Banco do Nordeste Cultural Mossoró — Rua 30 de Setembro, s/n, Centro',
  datas: 'quarta e quinta, 08 e 09 de julho',
  horario: '18h',
};

export function agoraBRT(): string {
  return new Date()
    .toLocaleString('pt-BR', {
      timeZone: 'America/Fortaleza',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    .replace(',', '');
}

export function hojeBRT(): string {
  return new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Fortaleza' });
}

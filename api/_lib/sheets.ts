import { JWT } from 'google-auth-library';
import { agoraBRT } from './config';

export const ABA_INSCRITOS = 'Inscritos';
export const ABA_RESUMO = 'Resumo';

export const CABECALHO = [
  'Data/hora',
  'Nome completo',
  'Nome social',
  'CPF',
  'E-mail',
  'Telefone',
  'Nascimento',
  'Raça/cor',
  'Identidade de gênero',
  'PCD',
  'Acessibilidade',
  'LGPD',
];

// Índices das colunas acima, para leitura das linhas
export const COL = {
  dataHora: 0,
  nome: 1,
  nomeSocial: 2,
  cpf: 3,
  email: 4,
  telefone: 5,
  nascimento: 6,
  raca: 7,
  genero: 8,
  pcd: 9,
  acessibilidade: 10,
  lgpd: 11,
};

let clienteJwt: JWT | null = null;

function cliente(): JWT {
  if (!clienteJwt) {
    clienteJwt = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  }
  return clienteJwt;
}

async function api(caminho: string, init?: RequestInit): Promise<any> {
  const { token } = await cliente().getAccessToken();
  const resp = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${process.env.SHEET_ID}${caminho}`,
    {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
    },
  );
  if (!resp.ok) {
    throw new Error(`Sheets API ${resp.status}: ${await resp.text()}`);
  }
  return resp.json();
}

let abasProntas = false;

// Cria as abas e o cabeçalho na primeira execução (idempotente)
export async function garantirAbas(): Promise<void> {
  if (abasProntas) return;
  const meta = await api('?fields=sheets.properties.title');
  const titulos: string[] = (meta.sheets || []).map((s: any) => s.properties.title);

  const faltantes = [ABA_INSCRITOS, ABA_RESUMO].filter((t) => !titulos.includes(t));
  if (faltantes.length > 0) {
    await api(':batchUpdate', {
      method: 'POST',
      body: JSON.stringify({
        requests: faltantes.map((title) => ({ addSheet: { properties: { title } } })),
      }),
    });
  }

  const primeira = await api(`/values/${ABA_INSCRITOS}!A1:L1`);
  if (!primeira.values || primeira.values.length === 0) {
    await api(`/values/${ABA_INSCRITOS}!A1?valueInputOption=RAW`, {
      method: 'PUT',
      body: JSON.stringify({ values: [CABECALHO] }),
    });
  }
  abasProntas = true;
}

export async function adicionarInscricao(linha: string[]): Promise<void> {
  await api(`/values/${ABA_INSCRITOS}!A1:append?valueInputOption=RAW`, {
    method: 'POST',
    body: JSON.stringify({ values: [linha] }),
  });
}

export async function lerInscritos(): Promise<string[][]> {
  const dados = await api(`/values/${ABA_INSCRITOS}!A2:L`);
  return dados.values || [];
}

function contarPor(linhas: string[][], coluna: number): [string, number][] {
  const contagem = new Map<string, number>();
  for (const l of linhas) {
    const v = (l[coluna] || '').trim() || '(sem resposta)';
    contagem.set(v, (contagem.get(v) || 0) + 1);
  }
  return [...contagem.entries()].sort((a, b) => b[1] - a[1]);
}

export interface Estatisticas {
  total: number;
  porRaca: [string, number][];
  porGenero: [string, number][];
  pcdSim: number;
  pedidosAcessibilidade: number;
}

export function calcularEstatisticas(linhas: string[][]): Estatisticas {
  return {
    total: linhas.length,
    porRaca: contarPor(linhas, COL.raca),
    porGenero: contarPor(linhas, COL.genero),
    pcdSim: linhas.filter((l) => l[COL.pcd] === 'Sim').length,
    pedidosAcessibilidade: linhas.filter((l) => (l[COL.acessibilidade] || '').trim()).length,
  };
}

// Reescreve a aba Resumo com valores calculados (evita fórmulas, que dependem do locale)
export async function atualizarResumo(linhas: string[][]): Promise<void> {
  const e = calcularEstatisticas(linhas);
  const valores: string[][] = [
    ['JORNADA DE PRODUÇÃO MUSICAL — RESUMO DAS INSCRIÇÕES', ''],
    ['Atualizado em', agoraBRT()],
    ['', ''],
    ['Total de inscrições', String(e.total)],
    ['Pessoas PCD', String(e.pcdSim)],
    ['Pedidos de acessibilidade', String(e.pedidosAcessibilidade)],
    ['', ''],
    ['RAÇA/COR', ''],
    ...e.porRaca.map(([nome, n]) => [nome, String(n)]),
    ['', ''],
    ['IDENTIDADE DE GÊNERO', ''],
    ...e.porGenero.map(([nome, n]) => [nome, String(n)]),
  ];
  await api(`/values/${ABA_RESUMO}!A1:B100:clear`, { method: 'POST', body: '{}' });
  await api(`/values/${ABA_RESUMO}!A1?valueInputOption=RAW`, {
    method: 'PUT',
    body: JSON.stringify({ values: valores }),
  });
}

export function linkPlanilha(): string {
  return `https://docs.google.com/spreadsheets/d/${process.env.SHEET_ID}`;
}

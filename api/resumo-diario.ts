import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ENCERRAMENTO, hojeBRT } from './_lib/config.js';
import { COL, calcularEstatisticas, garantirAbas, lerInscritos, linkPlanilha } from './_lib/sheets.js';
import { enviarWhatsApp } from './_lib/notificar.js';

const UM_DIA_MS = 24 * 60 * 60 * 1000;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const segredo = process.env.CRON_SECRET;
  if (segredo && req.headers.authorization !== `Bearer ${segredo}`) {
    return res.status(401).json({ ok: false, error: 'Não autorizado' });
  }

  // Para de mandar resumo um dia depois do fim das inscrições
  if (Date.now() > ENCERRAMENTO.getTime() + UM_DIA_MS) {
    return res.status(200).json({ ok: true, skipped: 'evento encerrado' });
  }

  try {
    await garantirAbas();
    const linhas = await lerInscritos();
    const e = calcularEstatisticas(linhas);
    const hoje = hojeBRT();
    const novasHoje = linhas.filter((l) => (l[COL.dataHora] || '').startsWith(hoje)).length;

    const fmt = (pares: [string, number][]) =>
      pares.map(([nome, n]) => `${nome}: ${n}`).join(' · ');

    const mensagem =
      `📊 Jornada de Produção Musical — resumo de ${hoje}\n` +
      `Hoje: ${novasHoje} nova(s) | Total: ${e.total} inscrições\n\n` +
      `Raça/cor → ${fmt(e.porRaca) || '—'}\n` +
      `Gênero → ${fmt(e.porGenero) || '—'}\n` +
      `PCD: ${e.pcdSim} | Pedidos de acessibilidade: ${e.pedidosAcessibilidade}\n\n` +
      `Planilha: ${linkPlanilha()}`;

    await enviarWhatsApp(mensagem);
    return res.status(200).json({ ok: true, total: e.total, hoje: novasHoje });
  } catch (err) {
    console.error('Falha no resumo diário:', err);
    return res.status(500).json({ ok: false, error: 'Falha ao gerar resumo' });
  }
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ENCERRAMENTO, agoraBRT } from './_lib/config';
import {
  adicionarInscricao,
  atualizarResumo,
  garantirAbas,
  lerInscritos,
  linkPlanilha,
} from './_lib/sheets';
import { enviarEmailAgradecimento, enviarWhatsApp } from './_lib/notificar';

function cpfValido(cpf: string): boolean {
  const d = (cpf || '').replace(/\D/g, '');
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  for (const t of [9, 10]) {
    let soma = 0;
    for (let i = 0; i < t; i++) soma += parseInt(d[i], 10) * (t + 1 - i);
    if (((soma * 10) % 11) % 10 !== parseInt(d[t], 10)) return false;
  }
  return true;
}

const texto = (v: unknown, max = 300): string =>
  typeof v === 'string' ? v.trim().slice(0, max) : '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Método não permitido' });
  }
  if (Date.now() > ENCERRAMENTO.getTime()) {
    return res.status(410).json({ ok: false, error: 'Inscrições encerradas' });
  }

  const b = req.body || {};

  // Honeypot: bots preenchem o campo escondido; respondemos sucesso sem gravar nada
  if (texto(b.website)) {
    return res.status(200).json({ ok: true });
  }

  const nome = texto(b.nome, 120);
  const nomeSocial = texto(b.nomeSocial, 120);
  const cpf = texto(b.cpf, 14);
  const email = texto(b.email, 120).toLowerCase();
  const telefone = texto(b.telefone, 20);
  const nascimento = texto(b.nascimento, 10);
  const raca = texto(b.raca, 40);
  const genero = b.genero === 'Outro' ? `Outro: ${texto(b.generoOutro, 80)}` : texto(b.genero, 40);
  const pcd = texto(b.pcd, 30);
  const acessibilidade = pcd === 'Sim' ? texto(b.acessibilidade, 500) : '';

  if (
    !nome ||
    !cpfValido(cpf) ||
    !/^\S+@\S+\.\S+$/.test(email) ||
    !nascimento ||
    !raca ||
    !genero ||
    !pcd ||
    b.lgpd !== true
  ) {
    return res.status(400).json({ ok: false, error: 'Dados inválidos ou incompletos' });
  }

  try {
    await garantirAbas();
    await adicionarInscricao([
      agoraBRT(),
      nome,
      nomeSocial,
      cpf,
      email,
      telefone,
      nascimento,
      raca,
      genero,
      pcd,
      acessibilidade,
      'Aceito',
    ]);
  } catch (err) {
    console.error('Falha ao gravar inscrição:', err);
    return res.status(500).json({ ok: false, error: 'Falha ao gravar inscrição' });
  }

  // A inscrição já está garantida na planilha; e-mail, resumo e aviso não podem derrubá-la
  let total = 0;
  try {
    const linhas = await lerInscritos();
    total = linhas.length;
    await atualizarResumo(linhas);
  } catch (err) {
    console.error('Falha ao atualizar resumo:', err);
  }

  const apelido = nomeSocial || nome;
  const resultados = await Promise.allSettled([
    enviarEmailAgradecimento(email, apelido),
    enviarWhatsApp(
      `🎧 Nova inscrição na Jornada de Produção Musical!\n` +
        `${apelido}${pcd === 'Sim' ? ' (PCD)' : ''}\n` +
        `Total: ${total || '?'} inscrições\n` +
        `Planilha: ${linkPlanilha()}`,
    ),
  ]);
  for (const r of resultados) {
    if (r.status === 'rejected') console.error('Falha em notificação:', r.reason);
  }

  return res.status(200).json({ ok: true });
}

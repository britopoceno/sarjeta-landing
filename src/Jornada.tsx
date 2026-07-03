import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

// Mesma data-limite usada no backend (api/_lib/config.ts): 09/07 às 18h de Brasília
const ENCERRAMENTO = new Date('2026-07-09T21:00:00Z');
const GRUPO_WHATSAPP = 'https://chat.whatsapp.com/HZIadpy45DQKnRqu8dAuEZ';

const RACAS = ['Branca', 'Preta', 'Parda', 'Amarela', 'Indígena', 'Prefiro não responder'];
const GENEROS = [
  'Mulher cisgênero',
  'Homem cisgênero',
  'Mulher trans',
  'Homem trans',
  'Travesti',
  'Pessoa não-binária',
  'Outro',
  'Prefiro não responder',
];
const PCD_OPCOES = ['Não', 'Sim', 'Prefiro não responder'];

const LGPD_TEXTO =
  'Declaro estar ciente de que os dados fornecidos neste formulário serão utilizados exclusivamente para fins de inscrição, certificação e mapeamento de políticas afirmativas desta atividade, conforme a Lei Geral de Proteção de Dados (LGPD).';

export function cpfValido(cpf: string): boolean {
  const d = cpf.replace(/\D/g, '');
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  for (const t of [9, 10]) {
    let soma = 0;
    for (let i = 0; i < t; i++) soma += parseInt(d[i], 10) * (t + 1 - i);
    if (((soma * 10) % 11) % 10 !== parseInt(d[t], 10)) return false;
  }
  return true;
}

function mascaraCpf(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function mascaraTelefone(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const labelCls = 'font-mono text-xs font-bold uppercase tracking-widest block mb-2';
const inputCls =
  'w-full border-4 border-black bg-white p-3 font-body text-lg focus:outline-none focus:border-primary transition-colors';
const erroCls = 'text-primary font-bold text-sm mt-1 font-body';

interface Campos {
  nome: string;
  nomeSocial: string;
  cpf: string;
  email: string;
  telefone: string;
  nascimento: string;
  raca: string;
  genero: string;
  generoOutro: string;
  pcd: string;
  acessibilidade: string;
  lgpd: boolean;
  website: string; // honeypot anti-bot: humanos nunca preenchem
}

const vazio: Campos = {
  nome: '',
  nomeSocial: '',
  cpf: '',
  email: '',
  telefone: '',
  nascimento: '',
  raca: '',
  genero: '',
  generoOutro: '',
  pcd: '',
  acessibilidade: '',
  lgpd: false,
  website: '',
};

export default function Jornada() {
  const [campos, setCampos] = useState<Campos>(vazio);
  const [erros, setErros] = useState<Partial<Record<keyof Campos, string>>>({});
  const [estado, setEstado] = useState<'aberto' | 'enviando' | 'sucesso' | 'falha'>('aberto');
  const encerrado = Date.now() > ENCERRAMENTO.getTime();

  useEffect(() => {
    document.title = 'Jornada de Produção Musical — Rádio Sarjeta';
  }, []);

  const setCampo = (k: keyof Campos, v: string | boolean) =>
    setCampos((c) => ({ ...c, [k]: v }));

  function validar(): boolean {
    const e: Partial<Record<keyof Campos, string>> = {};
    if (!campos.nome.trim()) e.nome = 'Escreva seu nome completo.';
    if (!cpfValido(campos.cpf)) e.cpf = 'CPF inválido — confere os números?';
    if (!/^\S+@\S+\.\S+$/.test(campos.email.trim())) e.email = 'E-mail inválido.';
    if (campos.telefone && campos.telefone.replace(/\D/g, '').length < 10)
      e.telefone = 'Telefone incompleto (com DDD).';
    if (!campos.nascimento) e.nascimento = 'Informe sua data de nascimento.';
    if (!campos.raca) e.raca = 'Escolha uma opção.';
    if (!campos.genero) e.genero = 'Escolha uma opção.';
    if (campos.genero === 'Outro' && !campos.generoOutro.trim())
      e.generoOutro = 'Conta pra gente como você se identifica.';
    if (!campos.pcd) e.pcd = 'Escolha uma opção.';
    if (!campos.lgpd) e.lgpd = 'É preciso aceitar para se inscrever.';
    setErros(e);
    return Object.keys(e).length === 0;
  }

  async function enviar(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validar()) return;
    setEstado('enviando');
    try {
      const resp = await fetch('/api/inscrever', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campos),
      });
      const dados = await resp.json().catch(() => ({}));
      if (resp.ok && dados.ok) {
        setEstado('sucesso');
        window.scrollTo({ top: 0 });
      } else if (resp.status === 410) {
        setEstado('aberto'); // encerrado no servidor; recarrega estado visual
        window.location.reload();
      } else {
        setEstado('falha');
      }
    } catch {
      setEstado('falha');
    }
  }

  return (
    <>
      <div className="brutalist-bg"></div>
      <div className="fixed inset-0 bg-noise opacity-[0.03] pointer-events-none z-[100]"></div>

      <nav className="w-full p-6">
        <div className="flex justify-between items-center max-w-5xl mx-auto">
          <a
            href="/"
            className="flex items-center gap-2 font-body uppercase text-xs tracking-[0.3em] font-bold text-white hover:text-primary transition-colors"
          >
            <ArrowLeft size={16} /> Rádio Sarjeta
          </a>
          <img
            src="https://i.postimg.cc/ryWfdfMr/RADIO-SARJ.png"
            alt="Rádio Sarjeta Logo"
            className="w-14 h-14 animate-[spin_10s_linear_infinite]"
          />
        </div>
      </nav>

      <main className="relative z-20 max-w-5xl mx-auto px-4 md:px-6 pb-32">
        <header className="mt-8 md:mt-16 mb-16">
          <div className="brutalist-card bg-secondary text-black inline-block md:-rotate-2 mb-8">
            <span className="font-mono text-xs font-bold uppercase tracking-widest">
              Oficina gratuita // 2 dias // Mossoró-RN
            </span>
          </div>
          <h1 className="font-display font-black uppercase tracking-tighter leading-[0.85] text-[clamp(2.5rem,9vw,7rem)] text-white">
            Jornada de<br />
            <span className="text-primary">Produção</span><br />
            Musical
          </h1>
          <div className="brutalist-card bg-white text-black max-w-2xl mt-10 md:rotate-1">
            <p className="font-impact text-xl md:text-2xl uppercase leading-tight mb-4">
              Você sempre quis produzir música mas não sabe por onde começar? 🎧🔥
            </p>
            <p className="font-body text-lg leading-tight">
              Dois dias de oficina entendendo gravação, edição, arranjo e os fluxos de
              trabalho na DAW. Você põe a mão na massa e no fim ainda sai com uma faixa
              que a galera TODA finalizou junta! É de graça e aberto pra todo mundo.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="brutalist-card bg-black text-white border-white">
              <span className="text-primary font-mono text-[0.65rem] tracking-widest uppercase block mb-2">Onde</span>
              <p className="font-body font-bold leading-tight">
                Banco do Nordeste Cultural Mossoró — Rua 30 de Setembro, s/n, Centro
              </p>
            </div>
            <div className="brutalist-card bg-black text-white border-white">
              <span className="text-primary font-mono text-[0.65rem] tracking-widest uppercase block mb-2">Quando</span>
              <p className="font-body font-bold leading-tight">Quarta e quinta, 08 e 09 de julho</p>
            </div>
            <div className="brutalist-card bg-black text-white border-white">
              <span className="text-primary font-mono text-[0.65rem] tracking-widest uppercase block mb-2">Horário</span>
              <p className="font-body font-bold leading-tight">A partir das 18h</p>
            </div>
          </div>
        </header>

        {encerrado && (
          <div className="brutalist-card bg-primary text-white text-center py-16">
            <h2 className="font-display font-black uppercase text-4xl md:text-6xl tracking-tighter mb-4">
              Inscrições encerradas
            </h2>
            <p className="font-body text-xl">
              Fica de olho no{' '}
              <a href="https://www.instagram.com/radiosarjeta" target="_blank" rel="noopener noreferrer" className="underline decoration-4">
                @radiosarjeta
              </a>{' '}
              pras próximas atividades!
            </p>
          </div>
        )}

        {!encerrado && estado === 'sucesso' && (
          <div className="brutalist-card bg-secondary text-black py-14 px-6 md:px-14">
            <div className="w-16 h-16 bg-black text-secondary flex items-center justify-center mb-6">
              <Check size={40} strokeWidth={4} />
            </div>
            <h2 className="font-display font-black uppercase text-4xl md:text-6xl tracking-tighter mb-6 leading-none">
              Inscrição<br />confirmada!
            </h2>
            <p className="font-body text-xl leading-tight mb-4">
              Te esperamos dia <strong>08/07 às 18h</strong> no Banco do Nordeste Cultural
              Mossoró. Enviamos um e-mail de confirmação — se não achar, espia a caixa de spam.
            </p>
            <p className="font-body text-xl leading-tight mb-8">
              Entra no grupo do evento pra não perder nenhum aviso:
            </p>
            <a
              href={GRUPO_WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-black text-white px-8 py-4 font-bold uppercase tracking-widest border-4 border-black hover:bg-white hover:text-black transition-all"
            >
              Entrar no grupo do WhatsApp <ArrowRight size={20} />
            </a>
          </div>
        )}

        {!encerrado && estado !== 'sucesso' && (
          <form onSubmit={enviar} noValidate className="brutalist-card bg-white text-black px-5 py-8 md:p-12">
            <h2 className="font-display font-black uppercase text-3xl md:text-5xl tracking-tighter mb-2">
              Bora fazer um som?
            </h2>
            <p className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-10">
              02. Inscrição / Campos com * são obrigatórios
            </p>

            <div className="space-y-8">
              <div>
                <label htmlFor="nome" className={labelCls}>Nome completo *</label>
                <input
                  id="nome"
                  type="text"
                  className={inputCls}
                  value={campos.nome}
                  onChange={(e) => setCampo('nome', e.target.value)}
                  autoComplete="name"
                />
                {erros.nome && <p className={erroCls}>{erros.nome}</p>}
              </div>

              <div>
                <label htmlFor="nomeSocial" className={labelCls}>Nome social</label>
                <input
                  id="nomeSocial"
                  type="text"
                  className={inputCls}
                  value={campos.nomeSocial}
                  onChange={(e) => setCampo('nomeSocial', e.target.value)}
                  placeholder="Como você quer ser chamade"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="cpf" className={labelCls}>CPF *</label>
                  <input
                    id="cpf"
                    type="text"
                    inputMode="numeric"
                    className={inputCls}
                    value={campos.cpf}
                    onChange={(e) => setCampo('cpf', mascaraCpf(e.target.value))}
                    placeholder="000.000.000-00"
                  />
                  {erros.cpf && <p className={erroCls}>{erros.cpf}</p>}
                </div>
                <div>
                  <label htmlFor="nascimento" className={labelCls}>Data de nascimento *</label>
                  <input
                    id="nascimento"
                    type="date"
                    className={inputCls}
                    value={campos.nascimento}
                    onChange={(e) => setCampo('nascimento', e.target.value)}
                    max={new Date().toISOString().slice(0, 10)}
                  />
                  {erros.nascimento && <p className={erroCls}>{erros.nascimento}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="email" className={labelCls}>E-mail para contato *</label>
                  <input
                    id="email"
                    type="email"
                    className={inputCls}
                    value={campos.email}
                    onChange={(e) => setCampo('email', e.target.value)}
                    autoComplete="email"
                    placeholder="voce@exemplo.com"
                  />
                  {erros.email && <p className={erroCls}>{erros.email}</p>}
                </div>
                <div>
                  <label htmlFor="telefone" className={labelCls}>Telefone (WhatsApp)</label>
                  <input
                    id="telefone"
                    type="tel"
                    inputMode="numeric"
                    className={inputCls}
                    value={campos.telefone}
                    onChange={(e) => setCampo('telefone', mascaraTelefone(e.target.value))}
                    placeholder="(84) 90000-0000"
                  />
                  {erros.telefone && <p className={erroCls}>{erros.telefone}</p>}
                </div>
              </div>

              <div className="border-t-4 border-black pt-8">
                <p className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-6">
                  As perguntas abaixo ajudam a mapear quem a oficina alcança (políticas afirmativas)
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label htmlFor="raca" className={labelCls}>Raça/cor *</label>
                    <select
                      id="raca"
                      className={inputCls}
                      value={campos.raca}
                      onChange={(e) => setCampo('raca', e.target.value)}
                    >
                      <option value="">Selecione…</option>
                      {RACAS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    {erros.raca && <p className={erroCls}>{erros.raca}</p>}
                  </div>
                  <div>
                    <label htmlFor="genero" className={labelCls}>Identidade de gênero *</label>
                    <select
                      id="genero"
                      className={inputCls}
                      value={campos.genero}
                      onChange={(e) => setCampo('genero', e.target.value)}
                    >
                      <option value="">Selecione…</option>
                      {GENEROS.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                    {erros.genero && <p className={erroCls}>{erros.genero}</p>}
                  </div>
                </div>

                {campos.genero === 'Outro' && (
                  <div className="mt-6">
                    <label htmlFor="generoOutro" className={labelCls}>Como você se identifica? *</label>
                    <input
                      id="generoOutro"
                      type="text"
                      className={inputCls}
                      value={campos.generoOutro}
                      onChange={(e) => setCampo('generoOutro', e.target.value)}
                    />
                    {erros.generoOutro && <p className={erroCls}>{erros.generoOutro}</p>}
                  </div>
                )}

                <div className="mt-8">
                  <label htmlFor="pcd" className={labelCls}>Você é uma pessoa com deficiência (PCD)? *</label>
                  <select
                    id="pcd"
                    className={inputCls}
                    value={campos.pcd}
                    onChange={(e) => setCampo('pcd', e.target.value)}
                  >
                    <option value="">Selecione…</option>
                    {PCD_OPCOES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  {erros.pcd && <p className={erroCls}>{erros.pcd}</p>}
                </div>

                {campos.pcd === 'Sim' && (
                  <div className="mt-6">
                    <label htmlFor="acessibilidade" className={labelCls}>
                      Caso necessite de alguma ferramenta de acessibilidade, por favor nos informe
                    </label>
                    <textarea
                      id="acessibilidade"
                      className={inputCls}
                      rows={3}
                      value={campos.acessibilidade}
                      onChange={(e) => setCampo('acessibilidade', e.target.value)}
                      placeholder="Ex.: intérprete de Libras, material ampliado, espaço para cadeira de rodas…"
                    />
                  </div>
                )}
              </div>

              <input
                type="text"
                name="website"
                value={campos.website}
                onChange={(e) => setCampo('website', e.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              <div className="border-t-4 border-black pt-8">
                <label className="flex items-start gap-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={campos.lgpd}
                    onChange={(e) => setCampo('lgpd', e.target.checked)}
                    className="mt-1 w-6 h-6 shrink-0 accent-[#FF4500] border-4 border-black"
                  />
                  <span className="font-body text-sm leading-snug">{LGPD_TEXTO}</span>
                </label>
                {erros.lgpd && <p className={erroCls}>{erros.lgpd}</p>}
              </div>

              {estado === 'falha' && (
                <div className="border-4 border-primary bg-primary/10 p-4 font-body font-bold text-primary" role="alert">
                  Eita, deu ruim ao enviar. Tenta de novo em instantes — se seguir travado,
                  chama a gente no @radiosarjeta.
                </div>
              )}

              <button
                type="submit"
                disabled={estado === 'enviando'}
                className="w-full md:w-auto bg-primary text-white px-12 py-5 font-bold uppercase tracking-widest text-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-60 disabled:cursor-wait cursor-pointer"
              >
                {estado === 'enviando' ? 'Enviando…' : 'Quero me inscrever!'}
              </button>
            </div>
          </form>
        )}

        <footer className="mt-20 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-white/40">
            Rádio Sarjeta // Ponto de Cultura // radiosarjeta@gmail.com
          </p>
        </footer>
      </main>
    </>
  );
}

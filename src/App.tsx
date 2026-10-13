import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, Sun, Moon, Menu, X } from 'lucide-react';
import { BlogNaHome } from './BlogNaHome';
import { Letreiro } from './Letreiro';
import { useCorNoCentro, useTituloPorSecao } from './efeitos';
import { PUBLICO, ROTAS } from './rotas';

const LOGO = `${PUBLICO}logo.png`;
const FOTOS = `${PUBLICO}fotos/`;

const REDES = {
  instagram: 'https://www.instagram.com/radiosarjeta',
  youtube: 'https://www.youtube.com/@RádioSarjeta',
  soundcloud: 'https://soundcloud.com/radiosarjeta',
  lab: 'https://app.sarjeta.com',
};

// Foto P&B que ganha cor: no hover (mouse) ou no meio da tela (toque, via useCorNoCentro).
const FOTO_VIVA = 'grayscale contrast-110 hover:grayscale-0 [.foto-viva_&]:grayscale-0 scale-105 hover:scale-100 [.foto-viva_&]:scale-100 transition-all duration-700';

type Cor = 'preto' | 'verde' | 'laranja' | 'branco';

type Projeto = {
  numero: string;
  area: string;
  titulo: string;
  frase?: string;
  foto: string;
  alt: string;
  largura: number;
  altura: number;
  posicao?: string;
  link: string;
  acao: string;
  cor: Cor;
  giro: string;
};

const PROJETOS: Projeto[] = [
  {
    numero: '01', area: 'Documentação & Difusão', titulo: 'Sarjeta Session',
    foto: 'sarjeta-session', alt: 'Pessoa sorrindo, com a camiseta da Rádio Sarjeta, ao lado de uma câmera no tripé, numa gravação ao ar livre',
    largura: 533, altura: 800, posicao: 'center 30%',
    link: 'https://youtube.com/playlist?list=PLtdkTVpYucm56xbqpgPO2FIyjPLwQfLxu&si=6Iv43ECnq-sUORF2', acao: 'Ver todos', cor: 'preto', giro: 'md:-rotate-1',
  },
  {
    numero: '02', area: 'Fruição & Formação', titulo: 'Som de Quinta',
    frase: 'O DJ enquanto educador e pesquisador.',
    foto: 'som-de-quinta', alt: 'DJ de costas, de fone, com a camiseta da Rádio Sarjeta, tocando à noite ao ar livre',
    largura: 533, altura: 800, posicao: 'center 40%',
    link: 'https://youtube.com/playlist?list=PLtdkTVpYucm7pt8IOk4Kxy08ikYiYVUpS&si=5NO2oPdCbV22alU7', acao: 'Saiba mais', cor: 'verde', giro: 'md:rotate-2',
  },
  {
    numero: '03', area: 'Documentação & Pesquisa', titulo: 'Bueiro Beat',
    foto: 'bueiro-beat', alt: 'Rapaz de fone, de perfil, diante do microfone numa gravação do Bueiro Beat; ao fundo, outra pessoa ao microfone',
    largura: 643, altura: 800, posicao: 'center 35%',
    link: 'https://on.soundcloud.com/SPzOr8H9RbtvtfDI4Q', acao: 'Ouça agora', cor: 'laranja', giro: 'md:rotate-1',
  },
  {
    numero: '04', area: 'Documentação & Difusão', titulo: 'In Tha House',
    foto: 'in-tha-house', alt: 'Trio tocando percussão e eletrônicos na cozinha de uma casa, numa gravação do In Tha House',
    largura: 1200, altura: 646, posicao: 'center',
    link: 'https://youtube.com/playlist?list=PLtdkTVpYucm4mXhJcOZAUBhAfpzqQ5teR&si=efRFqqe9hFyG2pl3', acao: 'Ver todos', cor: 'preto', giro: 'md:rotate-1',
  },
  {
    numero: '05', area: 'Acessibilidade', titulo: 'Som & Sinal',
    frase: 'Música e cultura para todos.',
    foto: 'som-e-sinal', alt: 'Intérprete sorrindo e sinalizando em Libras, com a marca da Rádio Sarjeta no canto',
    largura: 977, altura: 917, posicao: 'center 25%',
    link: 'https://youtube.com/playlist?list=PLtdkTVpYucm5vGCxPVZ8HKHZasrurNBfz&si=kwub7RkRODvVxGmQ', acao: 'Ver todos', cor: 'verde', giro: 'md:-rotate-2',
  },
];

function Foto({ p, classe }: { p: Projeto; classe: string }) {
  return (
    <div data-foto className={`foto group ${classe}`}>
      <img
        src={`${FOTOS}${p.foto}.webp`}
        alt={p.alt}
        width={p.largura}
        height={p.altura}
        loading="lazy"
        decoding="async"
        style={{ objectPosition: p.posicao }}
        className={FOTO_VIVA}
      />
    </div>
  );
}

/** A acao de cada cartao segue o padrao da landing de hoje: seta quadrada no preto, botao no verde e no laranja. */
function Acao({ p }: { p: Projeto }) {
  if (p.cor === 'preto') {
    return (
      <a href={p.link} target="_blank" rel="noopener noreferrer" className="seta-link">
        <span className="seta-quadrado"><ArrowRight size={22} aria-hidden="true" /></span>
        {p.acao}
      </a>
    );
  }
  return (
    <a href={p.link} target="_blank" rel="noopener noreferrer" className={`botao ${p.cor === 'laranja' ? 'botao--branco' : 'botao--preto'}`}>
      {p.acao} <ArrowUpRight size={18} aria-hidden="true" />
    </a>
  );
}

function CartaoProjeto({ p, classe = '' }: { p: Projeto; classe?: string }) {
  const rotuloCor = p.cor === 'preto' ? 'text-primary' : '';
  return (
    <div className={`cartao cartao--${p.cor} ${p.giro} ${classe}`}>
      <p className={`rotulo ${rotuloCor}`}>Projeto {p.numero} // {p.area}</p>
      <h3 id={`projeto-${p.numero}`} className="titulo-3 mt-5">{p.titulo}</h3>
      {p.frase && <p className="font-body text-lg italic mt-4">{p.frase}</p>}
      <div className="mt-7">
        <Acao p={p} />
      </div>
    </div>
  );
}

function ProjetoEmPar({ p, espelho = false }: { p: Projeto; espelho?: boolean }) {
  return (
    <article className={`projeto ${espelho ? 'projeto--espelho' : ''}`} aria-labelledby={`projeto-${p.numero}`}>
      <Foto p={p} classe="foto--quadrada" />
      <CartaoProjeto p={p} classe="projeto-cartao" />
    </article>
  );
}

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const radioCheio = useTituloPorSecao();
  useCorNoCentro();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const [sessao, quinta, bueiro, house, sinal] = PROJETOS;
  const fecharMenu = () => setIsMenuOpen(false);
  const rotuloTema = isDark ? 'Mudar para o tema claro' : 'Mudar para o tema escuro';
  const IconeTema = isDark ? Sun : Moon;

  return (
    <>
      <a className="pular" href="#conteudo">Pular para o conteúdo</a>
      <div className="brutalist-bg"></div>
      <div className="fixed inset-0 bg-noise opacity-[0.03] pointer-events-none z-[100]"></div>

      <header>
        <nav aria-label="Principal" className="fixed top-0 w-full z-[150] p-6 mix-blend-difference">
          <div className="flex justify-between items-center max-w-[1800px] mx-auto">
            <span className="font-display font-black text-2xl uppercase tracking-tighter text-white">Desde 2020</span>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-12 font-body uppercase text-xs tracking-[0.3em] font-bold text-white items-center">
              <a className="hover:text-primary transition-colors" href={REDES.lab} target="_blank" rel="noopener noreferrer">Sarjeta.Lab</a>
              <a className="hover:text-primary transition-colors" href="#manifesto">Quem somos</a>
              <a className="hover:text-primary transition-colors" href="#projetos">Projetos</a>
              <a className="hover:text-primary transition-colors" href={ROTAS.blog}>Blog</a>
              <a className="hover:text-primary transition-colors" href="#contato">Conexão</a>
              <a className="animate-breathing" href="#hero" aria-label="Rádio Sarjeta, voltar ao início">
                <img src={LOGO} alt="" width={64} height={64} className="w-16 h-16 logo-girando" />
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="md:hidden text-white p-2"
              aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={isMenuOpen}
              aria-controls="menu-celular"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={32} aria-hidden="true" /> : <Menu size={32} aria-hidden="true" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu Overlay */}
        <div
          id="menu-celular"
          inert={!isMenuOpen}
          aria-hidden={!isMenuOpen}
          className={`fixed inset-0 z-[140] bg-black transition-transform duration-500 flex flex-col items-center justify-center space-y-8 px-12 py-12 ${isMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}
        >
          <a className="text-3xl font-display font-black uppercase text-white hover:text-primary transition-all active:scale-95" href={REDES.lab} target="_blank" rel="noopener noreferrer" onClick={fecharMenu}>Sarjeta.lab</a>
          <a className="text-3xl font-display font-black uppercase text-white hover:text-primary transition-all active:scale-95 text-center leading-none" href="#manifesto" onClick={fecharMenu}>Quem<br />somos</a>
          <a className="text-3xl font-display font-black uppercase text-white hover:text-primary transition-all active:scale-95" href="#projetos" onClick={fecharMenu}>Projetos</a>
          <a className="text-3xl font-display font-black uppercase text-white hover:text-primary transition-all active:scale-95" href={ROTAS.blog} onClick={fecharMenu}>Blog</a>
          <a className="text-3xl font-display font-black uppercase text-white hover:text-primary transition-all active:scale-95" href="#contato" onClick={fecharMenu}>Conexão</a>
          <a className="pt-12 active:scale-90 transition-transform" href="#hero" aria-label="Rádio Sarjeta, voltar ao início" onClick={fecharMenu}>
            <img src={LOGO} alt="" width={128} height={128} className="w-32 h-32 logo-girando" />
          </a>
        </div>

        <div className="fixed-title">
          <h1 className="text-[18vw] font-display font-black leading-[0.75] tracking-tighter uppercase flex flex-col items-center select-none">
            <span className={`palavra mix-blend-difference ${radioCheio ? '' : 'contorno'}`}>RÁDIO</span>
            <span className={`palavra mix-blend-difference ${radioCheio ? 'contorno' : ''}`}>SARJETA</span>
          </h1>
        </div>
      </header>

      <main className="relative z-20 outline-none" id="conteudo" tabIndex={-1}>
        <section className="abertura largura" id="hero" data-titulo aria-label="Abertura">
          <div className="abertura-base">
            <div className="abertura-cartao cartao cartao--verde md:-rotate-2">
              <p className="font-impact text-[clamp(1.125rem,2.6vw,2.25rem)] uppercase leading-[1.05]">
                Documentação e difusão de expressões artísticas de grupos historicamente marginalizados no semiárido.
              </p>
            </div>
            <a className="abertura-acoes cartao cartao--branco cartao--assenta md:rotate-1" href="#manifesto">
              <p className="lead lead--abertura">Inovação e criatividade para desenvolver o território!</p>
            </a>
          </div>
        </section>

        <section className="secao" id="manifesto" data-titulo aria-labelledby="titulo-manifesto">
          <div className="largura">
            <div className="grid grid-cols-1 md:grid-cols-12 items-start">
              <div className="cartao cartao--branco md:col-span-12 xl:col-span-10 md:rotate-1 z-30">
                <p className="rotulo text-gray-600 mb-6">01. Quem somos / Origem</p>
                <h2 id="titulo-manifesto" className="titulo-2">
                  Nós somos Ponto de <span className="text-primary italic">Cultura</span>.
                </h2>
                <p className="lead mt-8 max-w-3xl">
                  A Rádio Sarjeta é uma plataforma multidisciplinar de <span className="bg-secondary px-2">BASE</span>.
                  Buscamos ampliar o acesso à arte produzida à <span className="bg-primary text-black px-2">MARGEM</span>.
                </p>
                <p className="texto text-gray-700 max-w-2xl mt-6">
                  Somos fruto das experiências de jovens artistas LGBTQIAPN+ do interior do semiárido e respondemos as suas demandas, desenvolvendo tecnologias sociais para a superação de desigualdades.
                </p>
              </div>
            </div>
          </div>
        </section>

        <Letreiro
          texto="TERRITÓRIO ● DOCUMENTAÇÃO ● DIFUSÃO ● EDUCAÇÃO ● DIVERSIDADE ● "
          faixa="bg-primary -rotate-3 py-8 md:py-12"
          letra="text-white text-4xl md:text-6xl"
        />

        <section className="secao" id="projetos" data-titulo aria-label="Projetos">
          <div className="largura">

            <div className="projetos-dupla">
              <ProjetoEmPar p={sessao} />
              <ProjetoEmPar p={quinta} espelho />
            </div>

            <article className="projeto-destaque my-28 md:my-40" aria-labelledby="projeto-03">
              <Foto p={bueiro} classe="foto--destaque" />
              <CartaoProjeto p={bueiro} classe="projeto-destaque-cartao text-center" />
            </article>

            <div className="projetos-dupla">
              <ProjetoEmPar p={house} />
              <ProjetoEmPar p={sinal} espelho />
            </div>
          </div>
        </section>

        <BlogNaHome />

        <section className="secao" id="contato" data-titulo aria-labelledby="titulo-contato">
          <div className="largura">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
              <div className="cartao cartao--branco md:col-span-8 md:-rotate-1">
                <h2 id="titulo-contato" className="titulo-2 titulo-2--menor">
                  Cultura<br /><span className="text-primary">viva</span>
                </h2>
                <p className="lead mt-6">Se faz todo dia!</p>
                <p className="font-display font-black text-[clamp(1.5rem,3.2vw,2.75rem)] leading-[1.25] uppercase tracking-tighter underline decoration-primary decoration-[6px] underline-offset-[5px] mt-10">
                  Fica de olho nas nossas redes.
                </p>
                <ul className="redes mt-10">
                  <li><a href={REDES.instagram} target="_blank" rel="noopener noreferrer">Instagram <ArrowUpRight aria-hidden="true" /></a></li>
                  <li><a href={REDES.youtube} target="_blank" rel="noopener noreferrer">YouTube <ArrowUpRight aria-hidden="true" /></a></li>
                  <li><a href={REDES.soundcloud} target="_blank" rel="noopener noreferrer">SoundCloud <ArrowUpRight aria-hidden="true" /></a></li>
                </ul>
              </div>
              <div className="relative md:col-span-4 mt-10 md:mt-28">
                <div className="cartao cartao--preto p-3 md:p-4 rotate-3">
                  <img alt="Marca da Rádio Sarjeta em branco sobre uma espiral granulada em preto e branco" width={800} height={800} loading="lazy" decoding="async" className="w-full filter grayscale contrast-125 border-4 border-black" src={`${FOTOS}conexao.webp`} />
                  <div aria-hidden="true" className="absolute -bottom-10 -left-10 bg-primary text-white p-8 font-impact text-6xl -rotate-6 shadow-[10px_10px_0px_0px_rgba(255,255,255,1)] border-4 border-black">
                    ♡
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="rodape relative z-20">
        <div className="largura rodape-hoje">
          <div>
            <p className="font-display font-black text-4xl uppercase tracking-tighter">Rádio Sarjeta</p>
            <p className="rotulo mt-3">© 2020 Eu sei que ninguém viu o sertão de metal, mas eu sonhei. // contato@sarjeta.com</p>
          </div>
          <div className="quadrados" aria-hidden="true">
            <span className="bg-primary"></span>
            <span className="bg-secondary"></span>
            <span className="bg-black"></span>
          </div>
        </div>
      </footer>

      <button
        type="button"
        aria-label={rotuloTema}
        className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[120] p-3 md:p-5 border-4 border-black bg-primary text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer"
        onClick={() => setIsDark(!isDark)}
      >
        <IconeTema size={24} aria-hidden="true" />
      </button>

      <div aria-hidden="true" className="fixed bottom-8 left-8 z-[120] font-mono text-[10px] uppercase tracking-[0.4em] origin-left -rotate-90 pointer-events-none text-white/30 hidden md:block">
        Exp. Web-Radioativa Clubber Rural do Semiárido
      </div>
    </>
  );
}

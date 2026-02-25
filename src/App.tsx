import React, { useEffect, useState } from 'react';
import { ArrowRight, Sun, Moon, Menu, X } from 'lucide-react';

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const percent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      setScrollPercent(percent);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <>
      <div className="brutalist-bg"></div>
      <div className="fixed inset-0 bg-noise opacity-[0.03] pointer-events-none z-[100]"></div>

      <nav className="fixed top-0 w-full z-[150] p-6 mix-blend-difference">
        <div className="flex justify-between items-center max-w-[1800px] mx-auto">
          <span className="font-display font-black text-2xl uppercase tracking-tighter text-white">Desde 2020</span>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-12 font-body uppercase text-xs tracking-[0.3em] font-bold text-white items-center">
            <a className="hover:text-primary transition-colors" href="https://app.sarjeta.com" target="_blank" rel="noopener noreferrer">Sarjeta.Lab</a>
            <a className="hover:text-primary transition-colors" href="#manifesto">Quem somos</a>
            <a className="hover:text-primary transition-colors" href="#projetos">Projetos</a>
            <a className="hover:text-primary transition-colors" href="#contato">Conexão</a>
            <div className="animate-breathing cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <img src="https://i.postimg.cc/ryWfdfMr/RADIO-SARJ.png" alt="Rádio Sarjeta Logo" className="w-16 h-16 animate-[spin_10s_linear_infinite]" />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-[140] bg-black transition-transform duration-500 flex flex-col items-center justify-center space-y-12 p-12 ${isMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
        <a className="text-3xl font-display font-black uppercase text-white hover:text-primary transition-all active:scale-95" href="https://app.sarjeta.com" target="_blank" rel="noopener noreferrer" onClick={() => setIsMenuOpen(false)}>Sarjeta.lab</a>
        <a className="text-3xl font-display font-black uppercase text-white hover:text-primary transition-all active:scale-95 text-center leading-none" href="#manifesto" onClick={() => setIsMenuOpen(false)}>Quem<br />somos</a>
        <a className="text-3xl font-display font-black uppercase text-white hover:text-primary transition-all active:scale-95" href="#projetos" onClick={() => setIsMenuOpen(false)}>Projetos</a>
        <a className="text-3xl font-display font-black uppercase text-white hover:text-primary transition-all active:scale-95" href="#contato" onClick={() => setIsMenuOpen(false)}>Conexão</a>
        <div
          className="pt-12 cursor-pointer active:scale-90 transition-transform"
          onClick={() => {
            setIsMenuOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <img src="https://i.postimg.cc/ryWfdfMr/RADIO-SARJ.png" alt="Rádio Sarjeta Logo" className="w-32 h-32 animate-[spin_10s_linear_infinite]" />
        </div>
      </div>

      <div className="fixed-title">
        <h1 className="text-[8vw] md:text-[18vw] font-display font-black leading-[0.75] tracking-tighter uppercase flex flex-col items-center select-none">
          <span
            className="mix-blend-difference transition-all duration-700"
            style={{
              WebkitTextStroke: scrollPercent > 0.05 && scrollPercent < 0.3 ? (window.innerWidth < 768 ? '1px white' : '2px white') : '0px',
              color: scrollPercent > 0.05 && scrollPercent < 0.3 ? 'transparent' : 'white'
            }}
          >
            RÁDIO
          </span>
          <span
            className="mix-blend-difference transition-all duration-700"
            style={{
              WebkitTextStroke: scrollPercent > 0.35 && scrollPercent < 0.6 ? (window.innerWidth < 768 ? '1px white' : '2px white') : (scrollPercent > 0.05 && scrollPercent < 0.3 ? '0px' : (window.innerWidth < 768 ? '1px white' : '2px white')),
              color: scrollPercent > 0.35 && scrollPercent < 0.6 ? 'transparent' : (scrollPercent > 0.05 && scrollPercent < 0.3 ? 'white' : 'transparent')
            }}
          >
            SARJETA
          </span>
        </h1>
      </div>

      <main className="relative z-20">
        <section className="block-section" id="hero">
          <div className="max-w-4xl mx-auto w-full flex flex-col items-start gap-8 mt-24 md:mt-48">
            <div className="brutalist-card bg-secondary text-black max-w-xl md:-rotate-2 scale-90 md:scale-100">
              <p className="font-impact text-[clamp(1.125rem,4vw,1.5rem)] uppercase leading-tight">Documentação e difusão de expressões artísticas de grupos historicamente marginalizados no semiárido.</p>
            </div>
            <div className="flex gap-4 ml-auto px-4 md:px-0">
              <a className="brutalist-card bg-white text-black font-bold uppercase tracking-widest hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-sm md:text-base md:rotate-1" href="#manifesto">
                Inovação e criatividade para desenvolver o território!
              </a>
            </div>
          </div>
        </section>

        <section className="block-section" id="manifesto">
          <div className="container mx-auto grid grid-cols-1 md:grid-cols-12 gap-0 items-center">
            <div className="md:col-start-2 md:col-span-8 brutalist-card bg-white text-black z-30 rotate-0 md:rotate-1">
              <h2 className="font-display text-[clamp(2rem,10vw,4.5rem)] font-black mb-8 leading-none uppercase">
                NÓS SOMOS PONTO DE <span className="text-primary italic">CULTURA</span>.
              </h2>
              <p className="text-[clamp(1.25rem,5vw,1.875rem)] font-body leading-tight mb-8">
                A Rádio Sarjeta é uma plataforma multidisciplinar de<span className="bg-secondary px-2">BASE</span>.
                Buscamos ampliar o acesso à arte produzida à <span className="bg-primary text-white px-2">MARGEM</span>.
              </p>
              <p className="text-lg md:text-xl font-body text-gray-700 max-w-2xl">
                Somos fruto das experiências de jovens artistas LGBTQIAPN+ do interior do semiárido e respondemos as suas demandas, desenvolvendo tecnologias sociais para a superação de desigualdades.
              </p>
              <div className="mt-8 font-mono text-xs font-bold uppercase tracking-widest text-gray-400">01. Quem somos / Origem</div>
            </div>
          </div>
        </section>

        <div className="relative overflow-hidden w-full">
          <div className="relative py-8 md:py-12 overflow-hidden bg-primary border-y-4 border-black -rotate-3 z-40 scale-110">
            <div className="marquee-fast whitespace-nowrap items-center gap-12 text-white font-impact text-4xl md:text-6xl uppercase">
              <span>TERRITÓRIO ● DOCUMENTAÇÃO ● DIFUSÃO ● EDUCAÇÃO ● DIVERSIDADE ● </span>
              <span>TERRITÓRIO ● DOCUMENTAÇÃO ● DIFUSÃO ● EDUCAÇÃO ● DIVERSIDADE ● </span>
            </div>
          </div>
        </div>

        <section className="block-section" id="projetos">
          <div className="container mx-auto space-y-32">

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-6 relative group overflow-hidden border-4 border-black">
                <img alt="Street Art Project" className="w-full grayscale hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100" src="https://i.postimg.cc/xT8SVrLW/IMG-3576.jpg" />
              </div>
              <div className="md:col-span-6 md:-ml-20 z-40">
                <div className="brutalist-card bg-black text-white border-white rotate-0 md:-rotate-1">
                  <span className="text-primary font-mono text-[clamp(0.6rem,2vw,0.75rem)] tracking-widest uppercase mb-4 block">Projeto 01 // Documentação & Difusão</span>
                  <h3 className="text-[clamp(1.25rem,6vw,4.5rem)] font-display font-black uppercase leading-tight tracking-tighter mb-6 text-balance">Sarjeta Session</h3>
                  <a href="https://youtube.com/playlist?list=PLtdkTVpYucm56xbqpgPO2FIyjPLwQfLxu&si=6Iv43ECnq-sUORF2" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group cursor-pointer">
                    <span className="w-12 h-12 bg-white text-black flex items-center justify-center rounded-none group-hover:bg-primary group-hover:text-white transition-colors">
                      <ArrowRight size={24} />
                    </span>
                    <span className="font-bold uppercase tracking-widest text-sm">Ver todos</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-start-7 md:col-span-6 md:order-2 relative group overflow-hidden border-4 border-black">
                <img alt="DJ Rádio Sarjeta" className="w-full grayscale hover:grayscale-0 transition-all duration-700" src="https://i.postimg.cc/SRrQTWF5/IMG-3298.jpg" />
              </div>
              <div className="md:col-start-2 md:col-span-6 md:-mr-20 z-40 md:order-1">
                <div className="brutalist-card bg-secondary text-black rotate-0 md:rotate-2">
                  <span className="font-mono text-[clamp(0.6rem,2vw,0.75rem)] tracking-widest uppercase mb-4 block">Projeto 02 // Fruição & Formação</span>
                  <h3 className="text-[clamp(1.25rem,8vw,4.5rem)] font-display font-black uppercase leading-tight tracking-tighter mb-4 text-balance">Som de Quinta</h3>
                  <p className="font-body text-lg italic mb-6">O DJ enquanto educador e pesquisador.</p>
                  <a href="https://youtube.com/playlist?list=PLtdkTVpYucm7pt8IOk4Kxy08ikYiYVUpS&si=5NO2oPdCbV22alU7" target="_blank" rel="noopener noreferrer" className="inline-block border-2 border-black px-6 py-2 font-black uppercase tracking-tighter hover:bg-black hover:text-white transition-all cursor-pointer">
                    Saiba mais
                  </a>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-8 md:col-start-3">
                <div className="relative group border-4 border-black overflow-hidden">
                  <img alt="Abstract Cultural Expression" className="w-full h-[500px] object-cover grayscale opacity-60" src="https://i.postimg.cc/L5Mh09J7/Whats-App-Image-2024-10-30-at-05-12-31.jpg" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 md:p-12">
                    <div className="brutalist-card bg-primary text-white md:rotate-1 text-center max-w-2xl">
                      <span className="font-mono text-[clamp(0.6rem,2vw,0.75rem)] tracking-widest uppercase mb-4 block">Projeto 03 // Documentação & Pesquisa</span>
                      <h3 className="text-[clamp(2rem,7vw,6rem)] font-display font-black uppercase leading-tight tracking-tighter mb-8">Bueiro<br />Beat</h3>
                      <a href="https://on.soundcloud.com/SPzOr8H9RbtvtfDI4Q" target="_blank" rel="noopener noreferrer" className="inline-block bg-white text-black px-12 py-4 font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all border-4 border-black cursor-pointer">
                        Ouça agora
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-6 relative group overflow-hidden border-4 border-black">
                <img alt="In Tha House" className="w-full grayscale hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100" src="https://i.postimg.cc/4xZ4C2NK/imagem-2026-02-23-174348517.png" />
              </div>
              <div className="md:col-span-6 md:-ml-20 z-40">
                <div className="brutalist-card bg-black text-white border-white rotate-0 md:-rotate-1">
                  <span className="text-primary font-mono text-[clamp(0.6rem,2vw,0.75rem)] tracking-widest uppercase mb-4 block">Projeto 04 // Documentação & Difusão</span>
                  <h3 className="text-[clamp(1.25rem,8vw,4.5rem)] font-display font-black uppercase leading-tight tracking-tighter mb-6 text-balance">In Tha House</h3>
                  <a href="https://youtube.com/playlist?list=PLtdkTVpYucm4mXhJcOZAUBhAfpzqQ5teR&si=efRFqqe9hFyG2pl3" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group cursor-pointer">
                    <span className="w-12 h-12 bg-white text-black flex items-center justify-center rounded-none group-hover:bg-primary group-hover:text-white transition-colors">
                      <ArrowRight size={24} />
                    </span>
                    <span className="font-bold uppercase tracking-widest text-sm">Ver todos</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-start-7 md:col-span-6 md:order-2 relative group overflow-hidden border-4 border-black">
                <img alt="Som & Sinal" className="w-full grayscale hover:grayscale-0 transition-all duration-700" src="https://i.postimg.cc/43sY5N94/imagem-2026-02-23-175035008.png" />
              </div>
              <div className="md:col-start-2 md:col-span-6 md:-mr-20 z-40 md:order-1">
                <div className="brutalist-card bg-secondary text-black rotate-0 md:rotate-2">
                  <span className="font-mono text-[clamp(0.6rem,2vw,0.75rem)] tracking-widest uppercase mb-4 block">Projeto 05 // Acessibilidade</span>
                  <h3 className="text-[clamp(1.25rem,8vw,4.5rem)] font-display font-black uppercase leading-tight tracking-tighter mb-4 text-balance">Som & Sinal</h3>
                  <p className="font-body text-lg italic mb-6">Música e cultura para todos.</p>
                  <a href="https://youtube.com/playlist?list=PLtdkTVpYucm5vGCxPVZ8HKHZasrurNBfz&si=kwub7RkRODvVxGmQ" target="_blank" rel="noopener noreferrer" className="inline-block border-2 border-black px-6 py-2 font-black uppercase tracking-tighter hover:bg-black hover:text-white transition-all cursor-pointer">
                    Ver todos
                  </a>
                </div>
              </div>
            </div>

          </div>
        </section>

        <section className="block-section" id="contato">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              <div className="brutalist-card bg-white text-black rotate-0 md:-rotate-1">
                <h2 className="text-[clamp(1.5rem,3.5vw,3.5rem)] font-display font-black mb-8 leading-[0.8] uppercase">
                  CULTURA<br /><span className="text-primary">viva</span>
                </h2>
                <p className="text-gray-800 text-xl mb-12 font-body leading-tight">
                  Se faz todo dia!
                </p>
                <div className="text-3xl md:text-5xl font-black underline decoration-primary decoration-8 block mb-12">
                  FICA DE OLHO NAS NOSSAS REDES.
                </div>
                <div className="flex flex-wrap gap-8 text-sm font-mono font-bold">
                  <a href="https://www.instagram.com/radiosarjeta" target="_blank" rel="noopener noreferrer" className="hover:text-primary cursor-pointer">INSTAGRAM ↗</a>
                  <a href="https://www.youtube.com/@RádioSarjeta" target="_blank" rel="noopener noreferrer" className="hover:text-primary cursor-pointer">YOUTUBE ↗</a>
                  <a href="https://soundcloud.com/radiosarjeta" target="_blank" rel="noopener noreferrer" className="hover:text-primary cursor-pointer">SOUNDCLOUD ↗</a>
                </div>
              </div>
              <div className="relative mt-20 md:mt-0">
                <div className="brutalist-card bg-surface-dark border-white/20 p-4 rotate-3">
                  <img alt="Cultural Scene" className="w-full filter grayscale contrast-125 border-4 border-black" src="https://i.postimg.cc/brCWDY2P/PERFIL-LINK.png" />
                  <div className="absolute -bottom-10 -left-10 bg-primary text-white p-8 font-impact text-6xl -rotate-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] border-4 border-black">
                    ♡
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="py-20 border-t-4 border-black bg-white text-black">
          <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <p className="font-display font-black text-4xl uppercase tracking-tighter">RÁDIO SARJETA</p>
              <p className="font-mono text-xs uppercase tracking-widest mt-2">© 2020 Eu sei que ninguém viu o sertão de metal, mas eu sonhei. // radiosarjeta@gmail.com</p>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 border-4 border-black bg-primary"></div>
              <div className="w-12 h-12 border-4 border-black bg-secondary"></div>
              <div className="w-12 h-12 border-4 border-black bg-black"></div>
            </div>
          </div>
        </footer>
      </main>

      <div className="fixed bottom-8 left-8 z-[120] font-mono text-[10px] uppercase tracking-[0.4em] origin-left -rotate-90 pointer-events-none text-white/30 hidden md:block">
        Exp. Web-Radioativa Clubber Rural do Semiárido
      </div>

      <button
        className="fixed bottom-8 right-8 z-[120] p-5 border-4 border-black bg-primary text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer"
        onClick={toggleTheme}
      >
        {isDark ? <Sun size={24} className="font-bold" /> : <Moon size={24} className="font-bold" />}
      </button>
    </>
  );
}

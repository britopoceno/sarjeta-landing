import { useEffect, useState } from 'react';

/**
 * Título fixo: a palavra cheia troca a cada seção marcada com `data-titulo`.
 * Seção par (contando só as visíveis): RÁDIO cheio e SARJETA no contorno; ímpar, o contrário.
 * Devolve true quando RÁDIO está cheio.
 */
export function useTituloPorSecao(): boolean {
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue;
          const visiveis = Array.from(document.querySelectorAll<HTMLElement>('[data-titulo]')).filter((s) => !s.hidden);
          setIndice(Math.max(0, visiveis.indexOf(entrada.target as HTMLElement)));
        }
      },
      // Uma faixa fina no meio da tela: vale a seção que está passando por ali.
      { rootMargin: '-45% 0px -54% 0px' },
    );
    document.querySelectorAll('[data-titulo]').forEach((secao) => observador.observe(secao));
    return () => observador.disconnect();
  }, []);

  return indice % 2 === 0;
}

/**
 * Fotos P&B ganham cor no hover. Em tela de toque não existe hover, então a foto
 * marcada com `data-foto` ganha cor enquanto passa pelo meio da tela.
 */
export function useCorNoCentro(): void {
  useEffect(() => {
    if (!window.matchMedia('(hover: none)').matches) return;
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) entrada.target.classList.toggle('foto-viva', entrada.isIntersecting);
      },
      { rootMargin: '-30% 0px -30% 0px' },
    );
    document.querySelectorAll('[data-foto]').forEach((foto) => observador.observe(foto));
    return () => observador.disconnect();
  }, []);
}

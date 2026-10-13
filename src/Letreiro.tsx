import type { CSSProperties } from 'react';

type Props = {
  texto: string;
  /** Classes da faixa: cor, borda e giro. */
  faixa: string;
  /** Classes do texto: cor e tamanho. */
  letra: string;
  /** Duração de uma volta. Texto mais longo pede volta mais lenta. */
  duracao?: string;
  /** Quando o texto repete o que já está na página, o letreiro é só eco visual. */
  decorativo?: boolean;
};

/** Faixa girada com texto correndo. A segunda cópia existe só para emendar a volta. */
export function Letreiro({ texto, faixa, letra, duracao = '15s', decorativo = false }: Props) {
  const estilo = { '--letreiro-duracao': duracao } as CSSProperties;
  return (
    <div className="relative w-full z-40" aria-hidden={decorativo || undefined}>
      <div className={`relative overflow-hidden border-y-4 border-black scale-110 ${faixa}`}>
        <div className={`marquee-fast whitespace-nowrap items-center gap-12 font-impact uppercase ${letra}`} style={estilo}>
          <span>{texto}</span>
          <span aria-hidden="true">{texto}</span>
        </div>
      </div>
    </div>
  );
}

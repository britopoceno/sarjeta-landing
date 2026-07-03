import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const CACHE = join(process.env.TEMP || '/tmp', 'sarjeta-fonts');
if (!existsSync(CACHE)) mkdirSync(CACHE, { recursive: true });

async function font(url: string, file: string): Promise<Buffer> {
  const p = join(CACHE, file);
  if (existsSync(p)) return readFileSync(p);
  const r = await fetch(url);
  if (!r.ok) throw new Error(`fonte ${file}: ${r.status}`);
  const b = Buffer.from(await r.arrayBuffer());
  writeFileSync(p, b);
  return b;
}

// helper para montar a árvore que o satori entende (sem JSX)
const h = (type: string, style: any, children?: any): any => ({
  type,
  props: { style, children },
});
const text = (s: string, style: any) => h('div', { display: 'flex', ...style }, s);

async function main() {
  const anton = await font(
    'https://github.com/google/fonts/raw/main/ofl/anton/Anton-Regular.ttf',
    'Anton.ttf',
  );
  const mono = await font(
    'https://github.com/google/fonts/raw/main/ofl/spacemono/SpaceMono-Bold.ttf',
    'SpaceMono-Bold.ttf',
  );

  const ORANGE = '#FF4500';
  const GREEN = '#39FF14';

  const title = (s: string, color: string) =>
    text(s, {
      fontFamily: 'Anton',
      fontSize: 118,
      lineHeight: 0.92,
      color,
      textTransform: 'uppercase',
      letterSpacing: -3,
    });

  const tree = h(
    'div',
    {
      width: 1200,
      height: 630,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      backgroundColor: '#0A0A0A',
      padding: 64,
      // grade de pontos sutil, igual à landing
      backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)',
      backgroundSize: '40px 40px',
    },
    [
      // tag verde no topo
      h(
        'div',
        {
          display: 'flex',
          alignSelf: 'flex-start',
          backgroundColor: GREEN,
          padding: '12px 22px',
          border: '4px solid #000',
        },
        text('OFICINA GRATUITA  ·  2 DIAS  ·  MOSSORÓ-RN', {
          fontFamily: 'Space Mono',
          fontSize: 24,
          fontWeight: 700,
          color: '#000',
          letterSpacing: 1,
        }),
      ),
      // título
      h('div', { display: 'flex', flexDirection: 'column' }, [
        title('Jornada de', '#FFFFFF'),
        title('Produção', ORANGE),
        title('Musical', '#FFFFFF'),
      ]),
      // rodapé: data/local + url
      h('div', { display: 'flex', flexDirection: 'column' }, [
        text('08 + 09 DE JULHO  —  A PARTIR DAS 18H', {
          fontFamily: 'Space Mono',
          fontSize: 30,
          fontWeight: 700,
          color: '#FFFFFF',
          marginBottom: 8,
        }),
        text('Banco do Nordeste Cultural · Mossoró-RN', {
          fontFamily: 'Space Mono',
          fontSize: 24,
          color: 'rgba(255,255,255,0.65)',
          marginBottom: 20,
        }),
        text('sarjeta.com/jornadamusical', {
          fontFamily: 'Space Mono',
          fontSize: 26,
          fontWeight: 700,
          color: GREEN,
        }),
      ]),
    ],
  );

  const svg = await satori(tree, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Anton', data: anton, weight: 400, style: 'normal' },
      { name: 'Space Mono', data: mono, weight: 700, style: 'normal' },
    ],
  });

  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  const out = join(process.cwd(), 'public', 'og-jornada.png');
  writeFileSync(out, png);
  console.log('OG gerada:', out, `(${(png.length / 1024).toFixed(0)} KB)`);
}

main().catch((e) => {
  console.error('FALHOU:', e);
  process.exit(1);
});

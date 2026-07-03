import { writeFileSync } from 'fs';
import { join } from 'path';
import { Resvg } from '@resvg/resvg-js';

// Ícone quadrado pensado para o recorte circular do WhatsApp:
// tudo dentro do círculo inscrito (raio ~452), fundo preenchido até as bordas.
const svg = `
<svg width="1000" height="1000" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="dots" width="46" height="46" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="2" fill="rgba(255,255,255,0.06)"/>
    </pattern>
  </defs>
  <rect width="1000" height="1000" fill="#0A0A0A"/>
  <rect width="1000" height="1000" fill="url(#dots)"/>
  <circle cx="500" cy="500" r="452" fill="none" stroke="#39FF14" stroke-width="28"/>

  <!-- fone de ouvido -->
  <path d="M275 500 A225 225 0 0 1 725 500" fill="none" stroke="#FF4500"
        stroke-width="64" stroke-linecap="round"/>
  <rect x="227" y="480" width="96" height="225" rx="40" fill="#FF4500"/>
  <rect x="677" y="480" width="96" height="225" rx="40" fill="#FF4500"/>
</svg>`;

const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1000 } }).render().asPng();
const out = join(process.cwd(), 'public', 'grupo-jornada-icon.png');
writeFileSync(out, png);
console.log('Ícone gerado:', out, `(${(png.length / 1024).toFixed(0)} KB)`);

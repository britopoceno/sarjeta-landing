import MarkdownIt from "markdown-it";

/**
 * Markdown do blog. Mesma configuracao segura do adm (`src/lib/markdown.ts`,
 * ARQ-39): `html: false`, imagem desligada com a regra `imagem_literal`, e
 * `linkPermitido` que so aceita http, https, mailto e caminho iniciado por `/`.
 *
 * Diferenca de proposito (dívida D-34 do adm): o adm renderiza por arvore React,
 * aqui a saida e uma string HTML. A configuracao e a mesma; a saida pode divergir.
 */

const ESQUEMAS_PERMITIDOS = ["https:", "http:", "mailto:"];

export const REL_LINK = "noopener noreferrer nofollow";

/**
 * `validateLink`: `https:`, `http:`, `mailto:` e caminho iniciado por uma barra.
 * Tudo o mais e recusado (`javascript:`, `data:`, `vbscript:`, `file:`, ancora
 * solta, endereco sem esquema). Controles e espaco saem antes de olhar o
 * esquema porque o navegador tambem os ignora (`java\tscript:` e `javascript:`).
 * `//` e `/\` levam a outro servidor e nao contam como caminho.
 */
export function linkPermitido(url: string): boolean {
  // eslint-disable-next-line no-control-regex
  const limpa = url.replace(/[\u0000- \u007f-\u009f]/g, "").toLowerCase();
  const esquema = /^([a-z][a-z0-9+.-]*:)/.exec(limpa)?.[1];
  if (esquema !== undefined) {
    return ESQUEMAS_PERMITIDOS.includes(esquema);
  }
  return limpa.startsWith("/") && !limpa.startsWith("//") && !limpa.startsWith("/\\");
}

/** `![alt](url)`, `![alt][ref]`, `![alt][]` e `![alt]` viram texto (sem requisicao de imagem). */
const REGRA_IMAGEM = /!\[[^\]\n]{0,300}\](?:\([^)\n]{0,2000}\)|\[[^\]\n]{0,300}\])?/y;

/** O titulo do post e o h1 da pagina: o corpo desce um nivel e para no h4. */
function tagDeTitulo(tag: string): string {
  const nivel = Number(tag.slice(1));
  return `h${Math.min(Math.max(nivel + 1, 2), 4)}`;
}

/** markdown-it 15 nao traz tipos (e o pacote de tipos ficou de fora de proposito): so o que se usa. */
export type Markdown = { render(texto: string): string };

export function criarMarkdown(siteUrl = "https://sarjeta.com"): Markdown {
  const md = new MarkdownIt({ html: false, linkify: false, typographer: false, breaks: false });
  md.disable(["image", "table", "strikethrough"]);
  md.validateLink = linkPermitido;
  md.inline.ruler.before("image", "imagem_literal", (state: any, silent: boolean) => {
    if (state.src.charCodeAt(state.pos) !== 0x21 || state.src.charCodeAt(state.pos + 1) !== 0x5b) {
      return false;
    }
    REGRA_IMAGEM.lastIndex = state.pos;
    const sequencia = REGRA_IMAGEM.exec(state.src);
    if (sequencia === null) {
      return false;
    }
    if (!silent) {
      state.push("text", "", 0).content = sequencia[0];
    }
    state.pos += sequencia[0].length;
    return true;
  });

  // Titulos: h1 -> h2 ... maximo h4.
  md.core.ruler.push("desce_titulos", (state: any) => {
    for (const token of state.tokens) {
      if (token.type === "heading_open" || token.type === "heading_close") {
        token.tag = tagDeTitulo(token.tag);
      }
    }
    return true;
  });

  // Links: rel em todos; aba nova so para http(s) de outro site.
  const hostDoSite = (() => {
    try {
      return new URL(siteUrl).host;
    } catch {
      return "";
    }
  })();
  md.renderer.rules.link_open = (tokens: any[], idx: number, options: any, _env: unknown, self: any) => {
    const token = tokens[idx];
    const href = String(token.attrGet("href") ?? "");
    if (!linkPermitido(href)) {
      // Segunda guarda, depois do validateLink: nenhum href fora da lista sai daqui.
      token.attrSet("href", "#");
    }
    token.attrSet("rel", REL_LINK);
    if (/^https?:/i.test(href)) {
      let externo = true;
      try {
        externo = new URL(href).host !== hostDoSite;
      } catch {
        externo = true;
      }
      if (externo) {
        token.attrSet("target", "_blank");
      }
    }
    return self.renderToken(tokens, idx, options);
  };

  return md;
}

/** Corpo em Markdown como HTML seguro (sem HTML cru, sem imagem, links restritos). */
export function renderizarMarkdown(md: Markdown, texto: string): string {
  return md.render(texto);
}

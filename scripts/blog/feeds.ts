import type { Post } from "./dados.ts";

/** Escapa texto e atributo XML/HTML. Tambem remove caracteres proibidos em XML 1.0. */
export function esc(texto: string): string {
  return texto
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffe\uffff]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function iso(ms: number): string {
  return new Date(ms).toISOString();
}

/** RFC 822 (a forma que o RSS 2.0 pede): "Tue, 29 Sep 2026 12:00:00 GMT". */
export function rfc822(ms: number): string {
  return new Date(ms).toUTCString();
}

export const POSTS_POR_PAGINA = 12;

export function totalDePaginas(qtd: number): number {
  return Math.max(1, Math.ceil(qtd / POSTS_POR_PAGINA));
}

/** Caminho da listagem: `/blog` na pagina 1, `/blog/pagina/N` nas demais. */
export function caminhoDaLista(pagina: number): string {
  return pagina <= 1 ? "/blog" : `/blog/pagina/${pagina}`;
}

export function gerarSitemap(posts: Post[], siteUrl: string): string {
  const urls: { loc: string; lastmod?: string }[] = [{ loc: `${siteUrl}/` }];
  if (posts.length > 0) {
    for (let p = 1; p <= totalDePaginas(posts.length); p++) {
      urls.push({ loc: `${siteUrl}${caminhoDaLista(p)}` });
    }
    for (const post of posts) {
      urls.push({ loc: `${siteUrl}/blog/${post.slug}`, lastmod: iso(post.atualizadoEm) });
    }
  }
  const itens = urls
    .map((u) => `  <url><loc>${esc(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}</url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${itens}\n</urlset>\n`;
}

export function gerarRss(posts: Post[], siteUrl: string, agora: number): string {
  const itens = posts
    .map((post) => {
      const link = `${siteUrl}/blog/${post.slug}`;
      return [
        "    <item>",
        `      <title>${esc(post.titulo)}</title>`,
        `      <link>${esc(link)}</link>`,
        `      <guid isPermaLink="true">${esc(link)}</guid>`,
        `      <pubDate>${rfc822(post.publicadoEm)}</pubDate>`,
        `      <description>${esc(post.resumo)}</description>`,
        ...(post.autoria ? [`      <dc:creator>${esc(post.autoria)}</dc:creator>`] : []),
        ...post.categorias.map((c) => `      <category>${esc(c)}</category>`),
        "    </item>",
      ].join("\n");
    })
    .join("\n");
  const ultima = posts.length > 0 ? Math.max(...posts.map((p) => p.atualizadoEm)) : agora;
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">`,
    `  <channel>`,
    `    <title>Rádio Sarjeta · Blog</title>`,
    `    <link>${esc(siteUrl)}/</link>`,
    `    <description>Notícias e textos do coletivo Rádio Sarjeta.</description>`,
    `    <language>pt-BR</language>`,
    `    <lastBuildDate>${rfc822(ultima)}</lastBuildDate>`,
    `    <atom:link href="${esc(siteUrl)}/rss.xml" rel="self" type="application/rss+xml" />`,
    itens,
    `  </channel>`,
    `</rss>`,
    ``,
  ]
    .filter((l, i, a) => !(l === "" && i < a.length - 1))
    .join("\n");
}

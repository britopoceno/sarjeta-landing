import { normalizarCredito, type Post } from "./dados.ts";
import { caminhoDaLista, esc, iso, POSTS_POR_PAGINA, totalDePaginas } from "./feeds.ts";
import { renderizarMarkdown, type Markdown } from "./markdown.ts";

const NOME = "Rádio Sarjeta";
const DESCRICAO_BLOG = "Notícias e textos do coletivo Rádio Sarjeta: documentação e difusão de expressões artísticas no semiárido.";

const FONTES =
  "https://fonts.googleapis.com/css2?family=Anton&family=Courier+Prime:wght@400;700&family=Space+Grotesk:wght@400;500;700&family=Syne:wght@700;800&display=swap";

export type Contexto = { siteUrl: string; md: Markdown; semIndexar: boolean };

const FORMATO_DATA = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "America/Fortaleza",
});

export function dataLonga(ms: number): string {
  return FORMATO_DATA.format(new Date(ms));
}

/** Uma linha so, no tamanho de meta description. */
export function aparar(texto: string, max = 200): string {
  const limpo = texto.replace(/\s+/g, " ").trim();
  return limpo.length <= max ? limpo : `${limpo.slice(0, max - 1).trimEnd()}…`;
}

/** Texto simples aproximado do Markdown, so para derivar descricao quando o resumo vem vazio. */
function textoDoMarkdown(md: string): string {
  return md
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function descricaoDoPost(post: Post): string {
  return aparar(post.resumo !== "" ? post.resumo : textoDoMarkdown(post.corpoMarkdown));
}

/** JSON dentro de <script>: `<` e separadores de linha escapados, para nunca fechar a tag. */
export function jsonSeguro(obj: unknown): string {
  return JSON.stringify(obj)
    .replace(/</g, "\\u003c")
    .replace(new RegExp("\u2028", "g"), "\\u2028")
    .replace(new RegExp("\u2029", "g"), "\\u2029");
}

type Pagina = {
  titulo: string;
  descricao: string;
  canonical: string;
  ogTipo: "website" | "article";
  imagem: { url: string; alt: string };
  jsonld?: unknown;
  corpo: string;
  semIndexar: boolean;
  publicadoEm?: number;
  atualizadoEm?: number;
  categorias?: string[];
  autoria?: string;
};

function cabecalhoDoSite(): string {
  return `<a class="pular" href="#conteudo">Pular para o conteúdo</a>
<header class="topo">
  <a class="marca" href="/">${NOME}</a>
  <nav aria-label="Principal">
    <ul>
      <li><a href="/#manifesto">Quem somos</a></li>
      <li><a href="/#projetos">Projetos</a></li>
      <li><a href="/#contato">Conexão</a></li>
      <li><a href="/blog" aria-current="page">Blog</a></li>
    </ul>
  </nav>
</header>`;
}

function rodape(): string {
  return `<footer class="rodape">
  <p><a href="/">${NOME}</a> · Desde 2020 · <a href="/rss.xml">RSS</a></p>
</footer>`;
}

function documento(p: Pagina): string {
  const meta = [
    `<meta charset="UTF-8" />`,
    `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`,
    `<title>${esc(p.titulo)}</title>`,
    `<meta name="description" content="${esc(p.descricao)}" />`,
    `<link rel="canonical" href="${esc(p.canonical)}" />`,
    ...(p.semIndexar ? [`<meta name="robots" content="noindex, nofollow" />`] : []),
    `<meta name="theme-color" content="#050505" media="(prefers-color-scheme: dark)" />`,
    `<meta name="theme-color" content="#f4f1ea" media="(prefers-color-scheme: light)" />`,
    `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`,
    `<link rel="alternate icon" type="image/png" href="/logo.png" />`,
    `<link rel="alternate" type="application/rss+xml" title="${NOME} · Blog" href="/rss.xml" />`,
    `<meta property="og:site_name" content="${NOME}" />`,
    `<meta property="og:locale" content="pt_BR" />`,
    `<meta property="og:type" content="${p.ogTipo}" />`,
    `<meta property="og:title" content="${esc(p.titulo)}" />`,
    `<meta property="og:description" content="${esc(p.descricao)}" />`,
    `<meta property="og:url" content="${esc(p.canonical)}" />`,
    `<meta property="og:image" content="${esc(p.imagem.url)}" />`,
    `<meta property="og:image:alt" content="${esc(p.imagem.alt)}" />`,
    ...(p.ogTipo === "article" && p.publicadoEm !== undefined
      ? [
          `<meta property="article:published_time" content="${iso(p.publicadoEm)}" />`,
          `<meta property="article:modified_time" content="${iso(p.atualizadoEm ?? p.publicadoEm)}" />`,
          ...(p.autoria ? [`<meta property="article:author" content="${esc(p.autoria)}" />`] : []),
          ...(p.categorias ?? []).map((c) => `<meta property="article:tag" content="${esc(c)}" />`),
        ]
      : []),
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(p.titulo)}" />`,
    `<meta name="twitter:description" content="${esc(p.descricao)}" />`,
    `<meta name="twitter:image" content="${esc(p.imagem.url)}" />`,
    `<meta name="twitter:image:alt" content="${esc(p.imagem.alt)}" />`,
    `<link rel="preconnect" href="https://fonts.googleapis.com" />`,
    `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />`,
    `<link rel="stylesheet" href="${FONTES}" />`,
    `<link rel="stylesheet" href="/blog.css" />`,
    ...(p.jsonld ? [`<script type="application/ld+json">${jsonSeguro(p.jsonld)}</script>`] : []),
  ];
  return `<!doctype html>
<html lang="pt-BR">
<head>
${meta.map((l) => `  ${l}`).join("\n")}
</head>
<body>
${cabecalhoDoSite()}
<main id="conteudo" tabindex="-1">
${p.corpo}
</main>
${rodape()}
</body>
</html>
`;
}

function chips(categorias: string[]): string {
  if (categorias.length === 0) return "";
  return `<ul class="chips" aria-label="Categorias">${categorias.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>`;
}

function imagemPadrao(ctx: Contexto): { url: string; alt: string } {
  return { url: `${ctx.siteUrl}/ogp-preview.png`, alt: NOME };
}

function cartao(post: Post): string {
  const capa = post.capa
    ? `<div class="cartao-capa"><img src="${esc(post.capa.url)}" alt="${esc(post.capa.alt)}" loading="lazy" decoding="async" /></div>`
    : "";
  return `<li>
  <article class="cartao">
    ${capa}
    <div class="cartao-texto">
      ${chips(post.categorias)}
      <p class="data"><time datetime="${iso(post.publicadoEm)}">${dataLonga(post.publicadoEm)}</time>${post.autoria ? ` · ${esc(post.autoria)}` : ""}</p>
      <h2><a href="/blog/${esc(post.slug)}">${esc(post.titulo)}</a></h2>
      ${post.resumo ? `<p class="resumo">${esc(post.resumo)}</p>` : ""}
    </div>
  </article>
</li>`;
}

function paginacao(pagina: number, total: number): string {
  if (total <= 1) return "";
  const anterior = pagina > 1 ? `<a rel="prev" href="${caminhoDaLista(pagina - 1)}">← Mais recentes</a>` : `<span></span>`;
  const proxima = pagina < total ? `<a rel="next" href="${caminhoDaLista(pagina + 1)}">Mais antigos →</a>` : `<span></span>`;
  return `<nav class="paginacao" aria-label="Paginação">${anterior}<p>Página ${pagina} de ${total}</p>${proxima}</nav>`;
}

/** Pagina da listagem (`pagina` comeca em 1). Com lista vazia, mostra o estado vazio amigavel. */
export function paginaDaLista(ctx: Contexto, todos: Post[], pagina: number): string {
  const total = totalDePaginas(todos.length);
  const posts = todos.slice((pagina - 1) * POSTS_POR_PAGINA, pagina * POSTS_POR_PAGINA);
  const canonical = `${ctx.siteUrl}${caminhoDaLista(pagina)}`;
  const titulo = pagina > 1 ? `Blog, página ${pagina} · ${NOME}` : `Blog · ${NOME}`;
  const miolo =
    posts.length === 0
      ? `<p class="vazio">Ainda não publicamos nada aqui.</p>`
      : `<ol class="lista">\n${posts.map(cartao).join("\n")}\n</ol>\n${paginacao(pagina, total)}`;
  return documento({
    titulo,
    descricao: DESCRICAO_BLOG,
    canonical,
    ogTipo: "website",
    imagem: imagemPadrao(ctx),
    semIndexar: ctx.semIndexar,
    jsonld: {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: `${NOME} · Blog`,
      url: `${ctx.siteUrl}/blog`,
      inLanguage: "pt-BR",
      description: DESCRICAO_BLOG,
    },
    corpo: `<div class="miolo">
  <p class="kicker">Notícias e textos</p>
  <h1 class="titulo-blog">Blog</h1>
  ${miolo}
</div>`,
  });
}

/** Pagina de um post. */
export function paginaDoPost(ctx: Contexto, post: Post): string {
  const url = `${ctx.siteUrl}/blog/${post.slug}`;
  const descricao = descricaoDoPost(post);
  const imagem = post.capa ?? imagemPadrao(ctx);
  const atualizado = post.atualizadoEm - post.publicadoEm > 24 * 3600 * 1000;
  const credito = post.capa ? normalizarCredito(post.capa.credito) : undefined;
  const capa = post.capa
    ? `<figure class="capa"><img src="${esc(post.capa.url)}" alt="${esc(post.capa.alt)}" decoding="async" />${
        credito !== undefined ? `<figcaption class="capa-credito">${esc(credito)}</figcaption>` : ""
      }</figure>`
    : "";
  return documento({
    titulo: `${post.titulo} · ${NOME}`,
    descricao,
    canonical: url,
    ogTipo: "article",
    imagem,
    semIndexar: ctx.semIndexar,
    publicadoEm: post.publicadoEm,
    atualizadoEm: post.atualizadoEm,
    categorias: post.categorias,
    autoria: post.autoria,
    jsonld: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.titulo,
      description: descricao,
      url,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      datePublished: iso(post.publicadoEm),
      dateModified: iso(post.atualizadoEm),
      inLanguage: "pt-BR",
      ...(post.capa
        ? {
            image: [
              credito !== undefined
                ? { "@type": "ImageObject", url: post.capa.url, creditText: credito }
                : post.capa.url,
            ],
          }
        : {}),
      ...(post.categorias.length > 0 ? { keywords: post.categorias.join(", ") } : {}),
      author: post.autoria ? { "@type": "Person", name: post.autoria } : { "@type": "Organization", name: NOME },
      publisher: {
        "@type": "Organization",
        name: NOME,
        logo: { "@type": "ImageObject", url: `${ctx.siteUrl}/logo.png` },
      },
    },
    corpo: `<article class="miolo post">
  <p class="voltar"><a href="/blog">← Todos os textos</a></p>
  <header class="post-cabecalho">
    ${chips(post.categorias)}
    <h1 class="titulo-post">${esc(post.titulo)}</h1>
    <p class="data"><time datetime="${iso(post.publicadoEm)}">${dataLonga(post.publicadoEm)}</time>${post.autoria ? ` · Por ${esc(post.autoria)}` : ""}${
      atualizado ? ` · Atualizado em <time datetime="${iso(post.atualizadoEm)}">${dataLonga(post.atualizadoEm)}</time>` : ""
    }</p>
  </header>
  ${capa}
  <div class="corpo">
${renderizarMarkdown(ctx.md, post.corpoMarkdown)}
  </div>
</article>`,
  });
}

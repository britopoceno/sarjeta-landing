/**
 * Testes do gerador do blog. Rodar: `npm run test:blog` (tsx + node:test, sem dependencia nova).
 * Cobrem: HTML hostil, links (rel e esquemas), validacao defensiva, sitemap e RSS
 * bem formados com datas RFC 822 / ISO, estado vazio, paginacao e geracao em disco.
 */
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { validarPost, validarResposta, type Post } from "./dados.ts";
import { gerarRss, gerarSitemap, POSTS_POR_PAGINA } from "./feeds.ts";
import { gerarBlog } from "./gerar.ts";
import { criarMarkdown, linkPermitido } from "./markdown.ts";
import { paginaDaLista, paginaDoPost } from "./template.ts";

const SITE = "https://sarjeta.com";
const md = criarMarkdown(SITE);
const ctx = { siteUrl: SITE, md, semIndexar: false };

function post(n: number, extra: Partial<Post> = {}): Post {
  return {
    slug: `post-${n}`,
    titulo: `[exemplo] Post ${n}`,
    resumo: `[exemplo] Resumo ${n}`,
    corpoMarkdown: `Corpo ${n}`,
    capa: null,
    categorias: [],
    autoria: "",
    publicadoEm: 1_790_000_000_000 - n * 86_400_000,
    atualizadoEm: 1_790_000_000_000 - n * 86_400_000,
    ...extra,
  };
}

/** Verificador minimo de XML bem formado: tags balanceadas, sem `<` ou `&` soltos no texto. */
function xmlBemFormado(xml: string): void {
  const semDecl = xml.replace(/^<\?xml[^>]*\?>\s*/, "");
  const pilha: string[] = [];
  let i = 0;
  while (i < semDecl.length) {
    if (semDecl[i] === "<") {
      const fim = semDecl.indexOf(">", i);
      assert.notEqual(fim, -1, "tag sem fechamento");
      const tag = semDecl.slice(i + 1, fim);
      if (tag.startsWith("/")) {
        assert.equal(pilha.pop(), tag.slice(1).trim(), `tag de fechamento inesperada: ${tag}`);
      } else if (!tag.endsWith("/")) {
        pilha.push(/^[^\s>]+/.exec(tag)![0]);
      }
      i = fim + 1;
    } else {
      const prox = semDecl.indexOf("<", i);
      const texto = semDecl.slice(i, prox === -1 ? undefined : prox);
      assert.equal(/&(?!(amp|lt|gt|quot|#39);)/.test(texto), false, `& solto: ${texto.slice(0, 40)}`);
      assert.equal(texto.includes(">"), false, `> solto: ${texto.slice(0, 40)}`);
      i = prox === -1 ? semDecl.length : prox;
    }
  }
  assert.equal(pilha.length, 0, `tags abertas: ${pilha.join(",")}`);
}

const HOSTIL = [
  "<script>alert(1)</script>",
  "<img src=x onerror=alert(1)>",
  "[x](javascript:alert(1))",
  "[x](JaVaScRiPt:alert(1))",
  "[x](java\tscript:alert(1))",
  "[x](java&#x73;cript:alert(1))",
  "[x](data:text/html;base64,PHNjcmlwdD4=)",
  "![x](https://exemplo.com/p.gif)",
  '<a href="javascript:x">y</a>',
  "[a][r]\n\n[r]: javascript:x",
  "<div onclick=alert(1)>\nbloco\n</div>",
  "&lt;script&gt;",
].join("\n\n");

test("Markdown hostil: nenhum script, img, iframe, on* nem href perigoso na saida", () => {
  const html = md.render(HOSTIL);
  assert.doesNotMatch(html, /<script/i);
  assert.doesNotMatch(html, /<img/i);
  assert.doesNotMatch(html, /<iframe/i);
  assert.doesNotMatch(html, /<div/i);
  assert.doesNotMatch(html, /<[a-z][^>]*\son[a-z]+=/i);
  const hrefs = [...html.matchAll(/href="([^"]*)"/g)].map((m) => m[1]);
  for (const href of hrefs) {
    assert.equal(linkPermitido(href), true, `href fora da lista: ${href}`);
  }
  // O texto do HTML aparece como texto (escapado).
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  // Imagem vira texto literal, sem link para a URL.
  assert.match(html, /!\[x\]\(https:\/\/exemplo\.com\/p\.gif\)/);
  assert.doesNotMatch(html, /href="https:\/\/exemplo\.com\/p\.gif"/);
});

test("LAND-1: alt com mais de 300 caracteres ou com quebra de linha vira texto, sem link nem imagem", () => {
  const casos = [
    `![${"a".repeat(301)}](https://evil.example/x)`,
    "![a\nb](https://evil.example/x)",
    `![${"a".repeat(301)}][ref]\n\n[ref]: https://evil.example/x`,
    "![a\nb][ref]\n\n[ref]: https://evil.example/x",
    `![${"a".repeat(5000)}](https://evil.example/x)`,
  ];
  for (const fonte of casos) {
    const html = md.render(fonte);
    assert.doesNotMatch(html, /<a[\s>]/i, fonte.slice(0, 40));
    assert.doesNotMatch(html, /<img/i, fonte.slice(0, 40));
    assert.doesNotMatch(html, /href=/i, fonte.slice(0, 40));
  }
  // O alt longo e o sufixo aparecem como texto (escapado), sem perder o conteudo.
  const longo = md.render(`![${"a".repeat(301)}](https://evil.example/x)`);
  assert.match(longo, /!\[a{301}\]\(https:\/\/evil\.example\/x\)/);
  // Sem `]` adiante: so o `![` e o resto e texto comum.
  assert.match(md.render("![sem fecho"), /!\[sem fecho/);
  // Um link legitimo depois de uma imagem longa continua link.
  const depois = md.render(`![${"a".repeat(301)}](https://evil.example/x) e [ok](https://exemplo.com)`);
  assert.match(depois, /<a href="https:\/\/exemplo\.com"/);
  assert.doesNotMatch(depois, /href="https:\/\/evil\.example/);
  // Custo linear: muitos `![` sem fecho nao explodem.
  const t0 = Date.now();
  md.render("![".repeat(20_000));
  assert.ok(Date.now() - t0 < 2_000, "renderizacao de ![ repetido demorou demais");
});

test("linkPermitido: so http, https, mailto e caminho iniciado por /", () => {
  for (const ok of ["https://a.com", "http://a.com", "mailto:a@a.com", "/blog/x"]) {
    assert.equal(linkPermitido(ok), true, ok);
  }
  for (const ruim of ["javascript:x", "JAVASCRIPT:x", "java\tscript:x", "data:text/html,x", "vbscript:x", "file:///c", "ftp://a", "#x", "a.com", "//a.com", "/\\a.com"]) {
    assert.equal(linkPermitido(ruim), false, ruim);
  }
});

test("Links externos saem com rel e aba nova; mailto sem aba nova; internos sem aba nova", () => {
  const html = md.render("[a](https://exemplo.com) [b](mailto:a@a.com) [c](/blog) [d](https://sarjeta.com/x)");
  assert.match(html, /<a href="https:\/\/exemplo\.com" rel="noopener noreferrer nofollow" target="_blank">a<\/a>/);
  assert.match(html, /<a href="mailto:a@a\.com" rel="noopener noreferrer nofollow">b<\/a>/);
  assert.match(html, /<a href="\/blog" rel="noopener noreferrer nofollow">c<\/a>/);
  assert.match(html, /<a href="https:\/\/sarjeta\.com\/x" rel="noopener noreferrer nofollow">d<\/a>/);
  for (const a of html.match(/<a [^>]*>/g) ?? []) {
    assert.match(a, /rel="noopener noreferrer/);
  }
});

test("Titulos do corpo descem um nivel e param no h4", () => {
  const html = md.render("# a\n\n## b\n\n##### c");
  assert.match(html, /<h2>a<\/h2>/);
  assert.match(html, /<h3>b<\/h3>/);
  assert.match(html, /<h4>c<\/h4>/);
  assert.doesNotMatch(html, /<h1/);
});

test("Pagina do post escapa campos hostis e mantem canonical, OG, Twitter e JSON-LD validos", () => {
  const p = post(1, {
    titulo: `Titulo <script>alert(1)</script> "x" & y`,
    resumo: `Resumo "></head><script>alert(2)</script>`,
    autoria: `<i>Autoria</i>`,
    categorias: [`<b>c</b>`],
    capa: { url: "https://exemplo.convex.cloud/capa.png", alt: `alt "></script><script>x` },
    corpoMarkdown: HOSTIL,
  });
  const html = paginaDoPost(ctx, p);
  // Nenhuma tag script executavel: so o JSON-LD.
  const scripts = html.match(/<script[^>]*>/gi) ?? [];
  assert.deepEqual(scripts, ['<script type="application/ld+json">']);
  assert.doesNotMatch(html, /<img[^>]*onerror/i);
  assert.match(html, /<link rel="canonical" href="https:\/\/sarjeta\.com\/blog\/post-1" \/>/);
  assert.match(html, /<meta property="og:image" content="https:\/\/exemplo\.convex\.cloud\/capa\.png" \/>/);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image" \/>/);
  assert.match(html, /<html lang="pt-BR">/);
  assert.match(html, /<main id="conteudo"/);
  assert.match(html, /<img src="https:\/\/exemplo\.convex\.cloud\/capa\.png" alt="alt &quot;&gt;&lt;\/script&gt;&lt;script&gt;x"/);
  // JSON-LD: JSON valido, sem `<` cru, tipo BlogPosting.
  const bruto = /<script type="application\/ld\+json">(.*?)<\/script>/s.exec(html)![1];
  assert.equal(bruto.includes("<"), false);
  const ld = JSON.parse(bruto);
  assert.equal(ld["@type"], "BlogPosting");
  assert.equal(ld.headline, p.titulo);
  assert.equal(ld.url, "https://sarjeta.com/blog/post-1");
  assert.equal(ld.datePublished, new Date(p.publicadoEm).toISOString());
});

test("Pagina sem capa usa a imagem padrao do site no OG", () => {
  const html = paginaDoPost(ctx, post(1));
  assert.match(html, /og:image" content="https:\/\/sarjeta\.com\/ogp-preview\.png"/);
});

test("semIndexar (dados de exemplo) adiciona noindex", () => {
  const html = paginaDoPost({ ...ctx, semIndexar: true }, post(1));
  assert.match(html, /<meta name="robots" content="noindex, nofollow" \/>/);
  assert.doesNotMatch(paginaDoPost(ctx, post(1)), /noindex/);
});

test("Estado vazio: listagem amigavel, sitemap e RSS so com a home", () => {
  const lista = paginaDaLista(ctx, [], 1);
  assert.match(lista, /Ainda não publicamos nada aqui\./);
  assert.match(lista, /<h1 class="titulo-blog">Blog<\/h1>/);
  const sitemap = gerarSitemap([], SITE);
  xmlBemFormado(sitemap);
  assert.deepEqual([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]), ["https://sarjeta.com/"]);
  const rss = gerarRss([], SITE, 1_790_000_000_000);
  xmlBemFormado(rss);
  assert.equal((rss.match(/<item>/g) ?? []).length, 0);
});

test("Sitemap: home, listagem e posts, com URL absoluta e lastmod ISO; XML bem formado", () => {
  const posts = [post(1, { slug: "a-b" }), post(2, { titulo: "x & y" })];
  const xml = gerarSitemap(posts, SITE);
  xmlBemFormado(xml);
  const locs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  assert.deepEqual(locs, ["https://sarjeta.com/", "https://sarjeta.com/blog", "https://sarjeta.com/blog/a-b", "https://sarjeta.com/blog/post-2"]);
  for (const m of xml.matchAll(/<lastmod>(.*?)<\/lastmod>/g)) {
    assert.match(m[1], /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    assert.equal(new Date(m[1]).toISOString(), m[1]);
  }
});

test("RSS: bem formado, escapa texto hostil e usa datas RFC 822", () => {
  const posts = [post(1, { titulo: `A <b>&</b> "c"`, resumo: "]]> <script>", autoria: "Fulana & Cia", categorias: ["x<y"] })];
  const xml = gerarRss(posts, SITE, 1_790_000_000_000);
  xmlBemFormado(xml);
  assert.match(xml, /<rss version="2\.0"/);
  assert.match(xml, /<guid isPermaLink="true">https:\/\/sarjeta\.com\/blog\/post-1<\/guid>/);
  const rfc = /^[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} GMT$/;
  for (const m of xml.matchAll(/<(?:pubDate|lastBuildDate)>(.*?)<\/(?:pubDate|lastBuildDate)>/g)) {
    assert.match(m[1], rfc);
    assert.equal(Number.isNaN(Date.parse(m[1])), false);
  }
  assert.equal(xml.includes("<script>"), false);
});

test("Validacao defensiva: descarta post com campo faltando, slug ruim ou repetido; capa invalida vira sem capa", () => {
  const ok = post(1);
  const { posts, avisos } = validarResposta({
    posts: [
      ok,
      { ...ok, slug: "sem-titulo", titulo: undefined },
      { ...ok, slug: "../fuga" },
      { ...ok, slug: "img" },
      { ...ok, slug: "sem-data", publicadoEm: "ontem" },
      { ...ok, slug: "sem-corpo", corpoMarkdown: "" },
      { ...ok }, // slug repetido
      { ...ok, slug: "capa-ruim", capa: { url: "javascript:alert(1)", alt: "x" } },
      { ...ok, slug: "capa-sem-alt", capa: { url: "https://a.com/x.png", alt: "" } },
      "lixo",
      null,
    ],
  });
  assert.deepEqual(posts.map((p) => p.slug).sort(), ["capa-ruim", "capa-sem-alt", "post-1"]);
  assert.equal(posts.find((p) => p.slug === "capa-ruim")!.capa, null);
  assert.ok(avisos.length >= 8);
  assert.deepEqual(validarResposta(null).posts, []);
  assert.deepEqual(validarResposta({ posts: "x" }).posts, []);
  assert.ok("motivo" in validarPost({}, 0));
});

test("Fixture de exemplo: 3 posts validos, 1 descartado, todos marcados [exemplo]", async () => {
  const bruto = JSON.parse(await readFile(new URL("../fixtures/blog-exemplo.json", import.meta.url), "utf8"));
  const { posts, avisos } = validarResposta(bruto);
  assert.equal(posts.length, 3);
  assert.equal(avisos.length, 1);
  for (const p of posts) assert.match(p.titulo, /^\[exemplo\]/);
  const html = posts.map((p) => paginaDoPost(ctx, p)).join("\n");
  assert.equal((html.match(/<script[^>]*>/gi) ?? []).filter((s) => !s.includes("ld+json")).length, 0);
  assert.doesNotMatch(html, /href="javascript:/i);
});

test("Paginacao: mais de 12 posts gera /blog e /blog/pagina/N; em disco, com sitemap e rss", async () => {
  const dist = await mkdtemp(path.join(tmpdir(), "blog-teste-"));
  try {
    const posts = Array.from({ length: POSTS_POR_PAGINA + 3 }, (_, i) => post(i + 1));
    const { arquivos } = await gerarBlog({ dist, siteUrl: SITE, posts });
    assert.ok(arquivos.includes("blog/index.html"));
    assert.ok(arquivos.includes("blog/pagina/2/index.html"));
    assert.ok(arquivos.includes("blog/post-15/index.html"));
    assert.ok(arquivos.includes("sitemap.xml") && arquivos.includes("rss.xml"));
    const p1 = await readFile(path.join(dist, "blog/index.html"), "utf8");
    assert.equal((p1.match(/<article class="cartao">/g) ?? []).length, POSTS_POR_PAGINA);
    assert.match(p1, /rel="next" href="\/blog\/pagina\/2"/);
    const p2 = await readFile(path.join(dist, "blog/pagina/2/index.html"), "utf8");
    assert.equal((p2.match(/<article class="cartao">/g) ?? []).length, 3);
    assert.match(p2, /rel="prev" href="\/blog"/);
    assert.match(p2, /<link rel="canonical" href="https:\/\/sarjeta\.com\/blog\/pagina\/2" \/>/);
    xmlBemFormado(await readFile(path.join(dist, "sitemap.xml"), "utf8"));
    xmlBemFormado(await readFile(path.join(dist, "rss.xml"), "utf8"));
  } finally {
    await rm(dist, { recursive: true, force: true });
  }
});

test("Estado vazio em disco: /blog existe, sem posts, sitemap e rss so com a home", async () => {
  const dist = await mkdtemp(path.join(tmpdir(), "blog-teste-"));
  try {
    const { arquivos } = await gerarBlog({ dist, siteUrl: `${SITE}/`, posts: [] });
    assert.deepEqual(arquivos.sort(), ["blog/index.html", "rss.xml", "sitemap.xml"]);
    assert.match(await readFile(path.join(dist, "blog/index.html"), "utf8"), /Ainda não publicamos nada aqui\./);
  } finally {
    await rm(dist, { recursive: true, force: true });
  }
});

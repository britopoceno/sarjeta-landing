/**
 * Dados do blog: tipos, validacao defensiva e busca da rota publica do adm.
 *
 * Contrato (adm, `GET /blog/publicados`, so publicados, mais recentes primeiro, ate 100):
 * { geradoEm, posts: [{ slug, titulo, resumo, corpoMarkdown, capa: {url, alt, credito?} | null,
 *   categorias, autoria, publicadoEm, atualizadoEm }] }
 *
 * O build NUNCA pode falhar por causa dos dados: qualquer problema vira aviso e
 * o pior caso e o blog vazio.
 */

/** `credito` e opcional: a rota pode omitir, mandar null ou vazio. Texto simples, uma linha. */
export type Capa = { url: string; alt: string; credito?: string };

export const MAX_CREDITO = 200;

/**
 * Credito da foto: so texto. Quebras e espacos repetidos viram um espaco, caracteres de controle saem,
 * e acima de MAX_CREDITO o corte e por caractere Unicode (nunca no meio de um par substituto) com reticencias.
 * Devolve undefined quando nao ha texto util (ausente, nulo, vazio, nao-string).
 */
export function normalizarCredito(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const limpo = v
    .replace(/[\x00-\x08\x0b-\x1f\x7f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (limpo === "") return undefined;
  const letras = Array.from(limpo);
  return letras.length <= MAX_CREDITO ? limpo : `${letras.slice(0, MAX_CREDITO - 1).join("").trimEnd()}…`;
}

export type Post = {
  slug: string;
  titulo: string;
  resumo: string;
  corpoMarkdown: string;
  capa: Capa | null;
  categorias: string[];
  autoria: string;
  publicadoEm: number;
  atualizadoEm: number;
};

export type Validacao = { posts: Post[]; avisos: string[] };

/** Slugs que o adm nunca gera sozinhos (`SLUGS_RESERVADOS`); colidiriam com rotas do blog. */
export const SLUGS_RESERVADOS = ["img", "rss", "feed", "page", "pagina", "categoria", "tag", "index"];

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_POSTS = 100;
const MAX_CORPO = 200_000;

function ehTexto(v: unknown): v is string {
  return typeof v === "string";
}

function ehData(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v) && v > 0 && v <= 8.64e15;
}

function urlHttps(v: unknown): string | null {
  if (!ehTexto(v) || v.length > 2000) return null;
  try {
    const u = new URL(v);
    return u.protocol === "https:" ? u.href : null;
  } catch {
    return null;
  }
}

/** Valida um post. Devolve o post limpo ou o motivo do descarte. */
export function validarPost(bruto: unknown, indice: number): { post: Post; aviso?: string } | { motivo: string } {
  if (typeof bruto !== "object" || bruto === null || Array.isArray(bruto)) {
    return { motivo: `posts[${indice}] nao e objeto` };
  }
  const p = bruto as Record<string, unknown>;
  const rotulo = ehTexto(p.slug) ? p.slug : `posts[${indice}]`;

  if (!ehTexto(p.slug) || !SLUG.test(p.slug) || p.slug.length > 120) {
    return { motivo: `${rotulo}: slug ausente ou invalido` };
  }
  if (SLUGS_RESERVADOS.includes(p.slug)) {
    return { motivo: `${rotulo}: slug reservado` };
  }
  if (!ehTexto(p.titulo) || p.titulo.trim() === "") {
    return { motivo: `${rotulo}: titulo ausente` };
  }
  if (!ehTexto(p.corpoMarkdown) || p.corpoMarkdown.trim() === "") {
    return { motivo: `${rotulo}: corpoMarkdown ausente` };
  }
  if (p.corpoMarkdown.length > MAX_CORPO) {
    return { motivo: `${rotulo}: corpoMarkdown acima de ${MAX_CORPO} caracteres` };
  }
  if (!ehData(p.publicadoEm)) {
    return { motivo: `${rotulo}: publicadoEm ausente ou invalido` };
  }
  if (!ehTexto(p.resumo)) {
    return { motivo: `${rotulo}: resumo ausente` };
  }

  const avisos: string[] = [];
  let capa: Capa | null = null;
  if (p.capa !== null && p.capa !== undefined) {
    const c = p.capa as Record<string, unknown>;
    const url = typeof c === "object" ? urlHttps(c.url) : null;
    if (url !== null && ehTexto(c.alt) && c.alt.trim() !== "") {
      const credito = normalizarCredito(c.credito);
      capa = { url, alt: c.alt.trim(), ...(credito !== undefined ? { credito } : {}) };
    } else {
      avisos.push(`${rotulo}: capa invalida (precisa de url https e alt), post segue sem capa`);
    }
  }

  const categorias = Array.isArray(p.categorias)
    ? p.categorias.filter((c): c is string => ehTexto(c) && c.trim() !== "").map((c) => c.trim())
    : [];

  return {
    post: {
      slug: p.slug,
      titulo: p.titulo.trim(),
      resumo: p.resumo.trim(),
      corpoMarkdown: p.corpoMarkdown,
      capa,
      categorias,
      autoria: ehTexto(p.autoria) ? p.autoria.trim() : "",
      publicadoEm: p.publicadoEm,
      atualizadoEm: ehData(p.atualizadoEm) ? p.atualizadoEm : p.publicadoEm,
    },
    ...(avisos.length > 0 ? { aviso: avisos.join("; ") } : {}),
  };
}

/** Valida o JSON inteiro: descarta post com campo faltando, slug repetido, e ordena por data. */
export function validarResposta(json: unknown): Validacao {
  const avisos: string[] = [];
  if (typeof json !== "object" || json === null || !Array.isArray((json as { posts?: unknown }).posts)) {
    return { posts: [], avisos: ["resposta sem lista `posts`; blog vazio"] };
  }
  const lista = (json as { posts: unknown[] }).posts;
  const vistos = new Set<string>();
  const posts: Post[] = [];
  lista.forEach((bruto, i) => {
    const r = validarPost(bruto, i);
    if ("motivo" in r) {
      avisos.push(`post descartado: ${r.motivo}`);
      return;
    }
    if (r.aviso) avisos.push(r.aviso);
    if (vistos.has(r.post.slug)) {
      avisos.push(`post descartado: ${r.post.slug}: slug repetido`);
      return;
    }
    vistos.add(r.post.slug);
    posts.push(r.post);
  });
  posts.sort((a, b) => b.publicadoEm - a.publicadoEm);
  if (posts.length > MAX_POSTS) {
    avisos.push(`${posts.length} posts; usando os ${MAX_POSTS} mais recentes`);
    posts.length = MAX_POSTS;
  }
  return { posts, avisos };
}

export type Busca = Validacao & { origem: string; falhou: boolean };

/** Busca a rota publica com timeout. Nunca lanca: falha vira blog vazio com aviso. */
export async function buscarPosts(url: string, timeoutMs: number): Promise<Busca> {
  try {
    const resposta = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!resposta.ok) {
      return { posts: [], avisos: [`rota do blog respondeu ${resposta.status}; blog vazio`], origem: url, falhou: true };
    }
    const texto = await resposta.text();
    let json: unknown;
    try {
      json = JSON.parse(texto);
    } catch {
      return { posts: [], avisos: ["rota do blog nao devolveu JSON; blog vazio"], origem: url, falhou: true };
    }
    return { ...validarResposta(json), origem: url, falhou: false };
  } catch (erro) {
    const motivo = erro instanceof Error ? erro.name : "erro";
    return { posts: [], avisos: [`rota do blog inacessivel (${motivo}); blog vazio`], origem: url, falhou: true };
  }
}

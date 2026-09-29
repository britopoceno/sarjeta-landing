/**
 * Gera o blog estatico depois do `vite build`: `npm run build` chama este script.
 *
 * Variaveis (so nomes; nenhuma e segredo):
 *   BLOG_API_URL     rota publica do adm (padrao: a de producao, ver abaixo)
 *   SITE_URL         base das URLs absolutas (padrao https://sarjeta.com)
 *   BLOG_TIMEOUT_MS  timeout da busca (padrao 15000)
 *   BLOG_FIXTURE     arquivo JSON local para testar sem rede. IGNORADO em producao
 *                    (VERCEL_ENV=production): o build de producao so usa a rota real.
 *
 * Regra de ouro: este script NUNCA derruba o build. Rota ausente, fora do ar ou
 * com JSON ruim vira blog vazio ("Ainda nao publicamos nada aqui."), sitemap e
 * RSS so com a home, e um aviso no log.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { buscarPosts, validarResposta, type Validacao } from "./dados.ts";
import { gerarBlog } from "./gerar.ts";

// Hostname publico do deployment de producao do adm (docs/acesso.md do adm). Nao e segredo.
const BLOG_API_PADRAO = "https://original-wombat-190.convex.site/blog/publicados";

function aviso(msg: string): void {
  console.warn(`[blog] AVISO: ${msg}`);
}

async function main(): Promise<void> {
  const siteUrl = (process.env.SITE_URL || "https://sarjeta.com").replace(/\/+$/, "");
  const dist = path.resolve(process.cwd(), "dist");
  const emProducao = process.env.VERCEL_ENV === "production";
  const fixture = process.env.BLOG_FIXTURE;

  let resultado: Validacao;
  let origem: string;
  let semIndexar = false;

  if (fixture && emProducao) {
    aviso("BLOG_FIXTURE ignorado em producao; usando a rota real");
  }

  if (fixture && !emProducao) {
    origem = `fixture ${fixture}`;
    semIndexar = true;
    try {
      resultado = validarResposta(JSON.parse(await readFile(path.resolve(fixture), "utf8")));
    } catch (erro) {
      aviso(`nao consegui ler BLOG_FIXTURE (${erro instanceof Error ? erro.message : "erro"}); blog vazio`);
      resultado = { posts: [], avisos: [] };
    }
  } else {
    const url = process.env.BLOG_API_URL || BLOG_API_PADRAO;
    const timeout = Number(process.env.BLOG_TIMEOUT_MS) > 0 ? Number(process.env.BLOG_TIMEOUT_MS) : 15000;
    const busca = await buscarPosts(url, timeout);
    origem = busca.origem;
    resultado = busca;
  }

  for (const a of resultado.avisos) aviso(a);
  if (resultado.posts.length === 0) {
    aviso("nenhum post; gerando /blog com estado vazio, sitemap e RSS so com a home");
  }

  const { arquivos } = await gerarBlog({ dist, siteUrl, posts: resultado.posts, semIndexar });
  console.log(`[blog] origem: ${origem}${semIndexar ? " (noindex, dados de exemplo)" : ""}`);
  console.log(`[blog] ${resultado.posts.length} post(s); ${arquivos.length} arquivo(s) em dist/: ${arquivos.join(", ")}`);
}

main().catch(async (erro) => {
  // Ultima rede de seguranca: erro inesperado tambem nao derruba o deploy.
  aviso(`falha inesperada na geracao do blog: ${erro instanceof Error ? (erro.stack ?? erro.message) : String(erro)}`);
  try {
    await gerarBlog({
      dist: path.resolve(process.cwd(), "dist"),
      siteUrl: (process.env.SITE_URL || "https://sarjeta.com").replace(/\/+$/, ""),
      posts: [],
    });
    aviso("gerado o estado vazio como reserva");
  } catch {
    aviso("nem o estado vazio foi possivel; o build segue sem /blog");
  }
  process.exitCode = 0;
});

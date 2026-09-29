import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Post } from "./dados.ts";
import { caminhoDaLista, gerarRss, gerarSitemap, totalDePaginas } from "./feeds.ts";
import { criarMarkdown } from "./markdown.ts";
import { paginaDaLista, paginaDoPost } from "./template.ts";

export type Opcoes = {
  /** Pasta de saida do vite (`dist`). */
  dist: string;
  siteUrl: string;
  posts: Post[];
  /** Dados de exemplo: paginas saem com noindex. */
  semIndexar?: boolean;
  agora?: number;
};

export type Resumo = { arquivos: string[] };

async function gravar(dist: string, relativo: string, conteudo: string, arquivos: string[]): Promise<void> {
  const destino = path.join(dist, relativo);
  await mkdir(path.dirname(destino), { recursive: true });
  await writeFile(destino, conteudo, "utf8");
  arquivos.push(relativo.split(path.sep).join("/"));
}

/** Escreve /blog, /blog/pagina/N, /blog/<slug>, sitemap.xml e rss.xml em `dist`. */
export async function gerarBlog(o: Opcoes): Promise<Resumo> {
  const siteUrl = o.siteUrl.replace(/\/+$/, "");
  const ctx = { siteUrl, md: criarMarkdown(siteUrl), semIndexar: o.semIndexar === true };
  const arquivos: string[] = [];

  await rm(path.join(o.dist, "blog"), { recursive: true, force: true });

  for (let pagina = 1; pagina <= totalDePaginas(o.posts.length); pagina++) {
    const rel = path.join(caminhoDaLista(pagina).slice(1), "index.html");
    await gravar(o.dist, rel, paginaDaLista(ctx, o.posts, pagina), arquivos);
  }
  for (const post of o.posts) {
    await gravar(o.dist, path.join("blog", post.slug, "index.html"), paginaDoPost(ctx, post), arquivos);
  }
  await gravar(o.dist, "sitemap.xml", gerarSitemap(o.posts, siteUrl), arquivos);
  await gravar(o.dist, "rss.xml", gerarRss(o.posts, siteUrl, o.agora ?? Date.now()), arquivos);
  return { arquivos };
}

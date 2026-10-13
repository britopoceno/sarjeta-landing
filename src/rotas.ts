/** Endereços internos usados pela home. O blog é estático, gerado no build por scripts/blog. */
export const ROTAS = {
  blog: '/blog',
  post: (slug: string) => `/blog/${slug}`,
  /** Os 3 posts mais recentes, escritos por scripts/blog/gerar.ts. */
  ultimosPosts: '/blog/ultimos.json',
};

/** Arquivos de public/ (fotos, logo), respeitando a base do build. */
export const PUBLICO = import.meta.env.BASE_URL;

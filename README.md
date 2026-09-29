<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/cd714b02-953e-44c7-9ada-b476fca615ab

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


## Blog (sarjeta.com/blog)

Paginas estaticas geradas no build (`npm run build` = `vite build` + `scripts/blog/build-blog.ts`), a partir da rota publica do adm (`GET /blog/publicados`). Gera `/blog`, `/blog/pagina/N` (a cada 12 posts), `/blog/<slug>`, `sitemap.xml` e `rss.xml` em `dist/`. Markdown com `markdown-it` (HTML desligado, sem imagem no corpo, links so http/https/mailto).

Capa: `capa: { url, alt, credito? }`. O `credito` (texto simples, opcional; ausente, nulo ou vazio = sem legenda) vira uma `figcaption` abaixo da capa e `creditText` no JSON-LD; quebras de linha viram espaco e o texto e cortado em 200 caracteres.

Se a rota estiver fora do ar ou ainda nao existir, o build NAO falha: gera `/blog` vazio, sitemap e RSS so com a home e imprime `[blog] AVISO` no log.

Variaveis (nomes; nenhuma e segredo):

| Variavel | Para que serve |
|---|---|
| `BLOG_API_URL` | Endereco `.convex.site` da rota publica (tem padrao no script) |
| `SITE_URL` | Base das URLs absolutas (padrao `https://www.sarjeta.com`, o dominio canonico; o apex sarjeta.com redireciona 307) |
| `BLOG_TIMEOUT_MS` | Timeout da busca (padrao 15000) |
| `BLOG_FIXTURE` | So desenvolvimento: JSON local (ex.: `scripts/fixtures/blog-exemplo.json`); paginas saem com `noindex`; ignorada quando `VERCEL_ENV=production` |

Testes: `npm run test:blog` (tsx + node:test). Publicar de novo o site apos um post: Deploy Hook da Vercel, disparado pelo adm.

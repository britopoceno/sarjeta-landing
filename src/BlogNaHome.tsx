import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { ROTAS } from './rotas';

/** O que scripts/blog/gerar.ts escreve em /blog/ultimos.json para cada post. */
type Resumo = {
  slug: string;
  titulo: string;
  resumo: string;
  categorias: string[];
  publicadoEm: number;
  capa: { url: string; alt: string } | null;
};

const DATA = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Fortaleza' });

/** Giro e degrau de cada cartão, como os cartões do resto da home. */
const POSICOES = ['md:-rotate-1', 'md:rotate-2 md:mt-20', 'md:-rotate-2 md:mt-8'];

function ehResumo(p: unknown): p is Resumo {
  if (typeof p !== 'object' || p === null) return false;
  const r = p as Record<string, unknown>;
  return (
    typeof r.slug === 'string' &&
    typeof r.titulo === 'string' &&
    typeof r.resumo === 'string' &&
    typeof r.publicadoEm === 'number' &&
    Array.isArray(r.categorias)
  );
}

/** Os 3 textos mais recentes do blog. Sem post publicado, o mesmo aviso da página do blog. */
export function BlogNaHome() {
  // null enquanto a lista não chegou: assim o aviso de blog vazio não pisca antes dos posts.
  const [posts, setPosts] = useState<Resumo[] | null>(null);

  useEffect(() => {
    const controle = new AbortController();
    fetch(ROTAS.ultimosPosts, { signal: controle.signal })
      .then((resposta) => (resposta.ok ? resposta.json() : null))
      .then((json) => {
        setPosts(json && Array.isArray(json.posts) ? json.posts.filter(ehResumo).slice(0, 3) : []);
      })
      .catch((erro) => {
        if (erro?.name !== 'AbortError') setPosts([]);
      });
    return () => controle.abort();
  }, []);

  const lista = posts ?? [];

  return (
    <section className="secao" id="blog" data-titulo aria-labelledby="titulo-blog-home">
      <div className="largura">
        <div className="cartao cartao--verde md:rotate-2 w-fit max-w-full z-40">
          <p className="rotulo">Notícias e textos</p>
          <h2 id="titulo-blog-home" className="titulo-2 mt-5">Blog</h2>
          {lista.length > 0 && (
            <a href={ROTAS.blog} className="seta-link seta-link--escura mt-6">
              <span className="seta-quadrado"><ArrowRight size={22} aria-hidden="true" /></span>
              Todos os textos
            </a>
          )}
        </div>

        {posts !== null && posts.length === 0 && (
          <p className="cartao cartao--branco md:-rotate-1 w-fit max-w-full mt-14 font-impact text-[clamp(1.5rem,4vw,2.5rem)] uppercase leading-[1.1]">
            Ainda não publicamos nada aqui.
          </p>
        )}

        {lista.length > 0 && (
        <ol className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12 md:gap-10 mt-16 items-start">
          {lista.map((post, i) => (
            <li key={post.slug}>
              <article className={`blog-cartao cartao cartao--branco cartao--assenta ${POSICOES[i] ?? ''}`}>
                {post.capa && (
                  <img
                    src={post.capa.url}
                    alt={post.capa.alt}
                    loading="lazy"
                    decoding="async"
                    className="w-full aspect-video object-cover border-4 border-black mb-6"
                  />
                )}
                <p className="rotulo text-gray-600">
                  <time dateTime={new Date(post.publicadoEm).toISOString()}>{DATA.format(post.publicadoEm)}</time>
                </p>
                {post.categorias.length > 0 && (
                  <ul className="flex flex-wrap gap-2 mt-3" aria-label="Categorias">
                    {post.categorias.map((categoria) => (
                      <li key={categoria} className="rotulo bg-primary text-black border-2 border-black px-2 py-0.5">
                        {categoria}
                      </li>
                    ))}
                  </ul>
                )}
                <h3 className="font-display font-black uppercase text-[clamp(1.375rem,5.5vw,1.5rem)] leading-none tracking-tighter mt-5 mb-4 text-balance">
                  <a href={ROTAS.post(post.slug)} className="blog-cartao-link">
                    {post.titulo}
                  </a>
                </h3>
                {post.resumo && <p className="texto text-gray-800">{post.resumo}</p>}
              </article>
            </li>
          ))}
        </ol>
        )}
      </div>
    </section>
  );
}

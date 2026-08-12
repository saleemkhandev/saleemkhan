import { inject } from '@angular/core';
import { PrerenderFallback, RenderMode, ServerRoute } from '@angular/ssr';
import { ArticleRepository } from './core/content/article-repository';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: ':slug',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.None,
    async getPrerenderParams() {
      const articles = inject(ArticleRepository);
      return articles.getPublished().map((article) => ({ slug: article.slug }));
    },
  },
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];

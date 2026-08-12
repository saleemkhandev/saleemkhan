import { Route } from '@angular/router';
import { publishedArticleCanMatch } from './core/content/published-article.can-match';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import(
        './features/article-list/article-list-page/article-list-page'
      ).then((m) => m.ArticleListPage),
  },
  {
    path: ':slug',
    canMatch: [publishedArticleCanMatch],
    loadComponent: () =>
      import(
        './features/article-detail/article-detail-page/article-detail-page'
      ).then((m) => m.ArticleDetailPage),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found-page/not-found-page').then(
        (m) => m.NotFoundPage,
      ),
  },
];

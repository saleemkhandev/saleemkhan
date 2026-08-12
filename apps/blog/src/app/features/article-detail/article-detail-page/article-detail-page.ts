import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { ArticleRepository } from '../../../core/content/article-repository';
import { formatArticleDate } from '../../../core/content/format-article-date';
import { BlogSeo } from '../../../core/seo/blog-seo';

/**
 * Trust boundary for article HTML:
 *
 * Git-owned Markdown
 *   → build-time Marked renderer (raw HTML stripped)
 *   → Shiki-highlighted HTML in generated modules
 *   → this page via DomSanitizer.bypassSecurityTrustHtml
 *
 * Only trusted build-generated HTML is rendered. Do not treat future
 * CMS/user-submitted HTML as safe without a separate sanitization strategy.
 */
@Component({
  selector: 'app-article-detail-page',
  imports: [RouterLink],
  templateUrl: './article-detail-page.html',
  styleUrl: './article-detail-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleDetailPage {
  private readonly articles = inject(ArticleRepository);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly seo = inject(BlogSeo);

  /** Bound from the `:slug` route param via `withComponentInputBinding()`. */
  readonly slug = input.required<string>();

  protected readonly article = computed(() =>
    this.articles.getBySlug(this.slug()),
  );

  /**
   * `contentHtml` comes only from the trusted build-time Marked + Shiki
   * pipeline. Default Angular sanitization strips Shiki inline styles, so this
   * trusted HTML is marked safe for `[innerHTML]`.
   */
  protected readonly contentHtml = computed(() => {
    const article = this.article();
    if (!article) {
      return null;
    }

    return this.sanitizer.bypassSecurityTrustHtml(article.contentHtml);
  });

  protected readonly formatDate = formatArticleDate;

  constructor() {
    effect(() => {
      const article = this.article();
      if (article) {
        this.seo.applyArticlePage(article);
      }
    });
  }
}

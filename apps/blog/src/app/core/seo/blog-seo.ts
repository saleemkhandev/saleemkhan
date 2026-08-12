import { DOCUMENT, Injectable, RendererFactory2, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { BLOG_SITE, blogArticleUrl, blogIndexUrl } from '../constants/site';
import { ArticleSummary } from '../models/article';

const JSON_LD_ID = 'blog-json-ld';

/**
 * Blog-local document metadata helpers.
 * Keeps SEO out of shared libraries until a second consumer exists.
 */
@Injectable({ providedIn: 'root' })
export class BlogSeo {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly renderer = inject(RendererFactory2).createRenderer(
    null,
    null,
  );

  applyListPage(): void {
    const canonical = blogIndexUrl();
    const pageTitle = BLOG_SITE.listTitle;
    const description = BLOG_SITE.listDescription;

    this.title.setTitle(pageTitle);
    this.setDescription(description);
    this.setRobots(true);
    this.setCanonical(canonical);
    this.setOpenGraph({
      type: 'website',
      title: pageTitle,
      description,
      url: canonical,
    });
    this.setTwitter({
      title: pageTitle,
      description,
    });
    this.removeJsonLd();
  }

  applyArticlePage(article: ArticleSummary): void {
    const canonical = blogArticleUrl(article.slug);
    const pageTitle = `${article.title} | ${BLOG_SITE.name}`;
    const description = article.description;

    this.title.setTitle(pageTitle);
    this.setDescription(description);
    this.setRobots(true);
    this.setCanonical(canonical);
    this.setOpenGraph({
      type: 'article',
      title: pageTitle,
      description,
      url: canonical,
      publishedTime: article.publishedAt,
      tags: article.tags,
    });
    this.setTwitter({
      title: pageTitle,
      description,
    });
    this.setJsonLd(this.buildBlogPostingJsonLd(article, canonical));
  }

  applyNotFoundPage(): void {
    const pageTitle = `Page not found | ${BLOG_SITE.name}`;
    const description = 'The requested Blog page could not be found.';

    this.title.setTitle(pageTitle);
    this.setDescription(description);
    this.setRobots(false);
    this.clearCanonical();
    this.meta.removeTag("property='og:type'");
    this.meta.removeTag("property='og:title'");
    this.meta.removeTag("property='og:description'");
    this.meta.removeTag("property='og:url'");
    this.meta.removeTag("property='article:published_time'");
    this.meta.removeTag("name='twitter:title'");
    this.meta.removeTag("name='twitter:description'");
    this.removeJsonLd();
  }

  private setDescription(description: string): void {
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'author', content: BLOG_SITE.author });
  }

  private setRobots(index: boolean): void {
    const content = index
      ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
      : 'noindex, nofollow';
    this.meta.updateTag({ name: 'robots', content });
  }

  private setOpenGraph(options: {
    type: 'website' | 'article';
    title: string;
    description: string;
    url: string;
    publishedTime?: string;
    tags?: readonly string[];
  }): void {
    this.meta.updateTag({ property: 'og:type', content: options.type });
    this.meta.updateTag({
      property: 'og:site_name',
      content: BLOG_SITE.siteName,
    });
    this.meta.updateTag({ property: 'og:locale', content: 'en_IN' });
    this.meta.updateTag({ property: 'og:title', content: options.title });
    this.meta.updateTag({
      property: 'og:description',
      content: options.description,
    });
    this.meta.updateTag({ property: 'og:url', content: options.url });

    if (options.publishedTime) {
      this.meta.updateTag({
        property: 'article:published_time',
        content: options.publishedTime,
      });
    } else {
      this.meta.removeTag("property='article:published_time'");
    }

    // Replace previous article:tag entries for this document.
    this.document
      .querySelectorAll('meta[property="article:tag"]')
      .forEach((node) => node.remove());

    for (const tag of options.tags ?? []) {
      this.meta.addTag({ property: 'article:tag', content: tag });
    }
  }

  private setTwitter(options: { title: string; description: string }): void {
    this.meta.updateTag({ name: 'twitter:card', content: 'summary' });
    this.meta.updateTag({ name: 'twitter:title', content: options.title });
    this.meta.updateTag({
      name: 'twitter:description',
      content: options.description,
    });
  }

  private setCanonical(url: string): void {
    let link = this.document.querySelector(
      'link[rel="canonical"]',
    ) as HTMLLinkElement | null;

    if (!link) {
      link = this.renderer.createElement('link') as HTMLLinkElement;
      this.renderer.setAttribute(link, 'rel', 'canonical');
      this.renderer.appendChild(this.document.head, link);
    }

    this.renderer.setAttribute(link, 'href', url);
  }

  private clearCanonical(): void {
    this.document.querySelector('link[rel="canonical"]')?.remove();
  }

  private buildBlogPostingJsonLd(
    article: ArticleSummary,
    canonical: string,
  ): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: article.title,
      description: article.description,
      datePublished: article.publishedAt,
      author: {
        '@type': 'Person',
        name: BLOG_SITE.author,
        url: BLOG_SITE.portfolioUrl,
      },
      publisher: {
        '@type': 'Person',
        name: BLOG_SITE.author,
        url: BLOG_SITE.portfolioUrl,
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonical,
      },
      url: canonical,
      keywords: article.tags.join(', '),
    };
  }

  private setJsonLd(data: Record<string, unknown>): void {
    this.removeJsonLd();
    const script = this.renderer.createElement('script') as HTMLScriptElement;
    script.type = 'application/ld+json';
    script.id = JSON_LD_ID;
    // JSON.stringify escapes </script> sequences safely for HTML embedding.
    script.text = JSON.stringify(data);
    this.renderer.appendChild(this.document.head, script);
  }

  private removeJsonLd(): void {
    this.document.getElementById(JSON_LD_ID)?.remove();
  }
}

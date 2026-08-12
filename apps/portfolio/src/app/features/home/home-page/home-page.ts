import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  inject,
  OnInit,
  Renderer2,
} from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { buildJsonLd, SITE } from '../../../core/constants/site';
import { ProfilePanel } from '../../../layout/profile-panel/profile-panel';
import { SiteFooter } from '../../../layout/site-footer/site-footer';
import { Biography } from '../biography/biography';
import { EngineeringFocus } from '../engineering-focus/engineering-focus';
import { Experience } from '../experience/experience';
import { Intro } from '../intro/intro';
import { Journey } from '../journey/journey';

@Component({
  selector: 'app-home-page',
  imports: [
    ProfilePanel,
    Intro,
    Biography,
    Experience,
    EngineeringFocus,
    Journey,
    SiteFooter,
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage implements OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly renderer = inject(Renderer2);

  ngOnInit(): void {
    const pageTitle = SITE.pageTitle;
    const canonical = `${SITE.domain}/`;
    const ogImage = `${SITE.domain}${SITE.ogImage.src}`;

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: SITE.description });
    this.meta.updateTag({
      name: 'keywords',
      content: SITE.keywords.join(', '),
    });
    this.meta.updateTag({ name: 'author', content: SITE.name });
    this.meta.updateTag({
      name: 'robots',
      content:
        'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    });
    this.meta.updateTag({ name: 'googlebot', content: 'index, follow' });

    this.setCanonical(canonical);

    this.meta.updateTag({ property: 'og:type', content: 'profile' });
    this.meta.updateTag({ property: 'og:site_name', content: SITE.name });
    this.meta.updateTag({ property: 'og:locale', content: 'en_IN' });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({
      property: 'og:description',
      content: SITE.description,
    });
    this.meta.updateTag({ property: 'og:url', content: canonical });
    this.meta.updateTag({ property: 'og:image', content: ogImage });
    this.meta.updateTag({
      property: 'og:image:alt',
      content: SITE.ogImage.alt,
    });
    this.meta.updateTag({
      property: 'og:image:width',
      content: String(SITE.ogImage.width),
    });
    this.meta.updateTag({
      property: 'og:image:height',
      content: String(SITE.ogImage.height),
    });
    this.meta.updateTag({ property: 'og:image:type', content: 'image/jpeg' });
    this.meta.updateTag({ property: 'profile:first_name', content: 'Saleem' });
    this.meta.updateTag({ property: 'profile:last_name', content: 'Khan' });

    this.meta.updateTag({
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({
      name: 'twitter:description',
      content: SITE.description,
    });
    this.meta.updateTag({ name: 'twitter:image', content: ogImage });
    this.meta.updateTag({
      name: 'twitter:image:alt',
      content: SITE.ogImage.alt,
    });

    this.injectJsonLd();
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

  private injectJsonLd(): void {
    const existing = this.document.getElementById('site-json-ld');
    if (existing) {
      existing.remove();
    }

    const script = this.renderer.createElement('script') as HTMLScriptElement;
    script.type = 'application/ld+json';
    script.id = 'site-json-ld';
    script.text = JSON.stringify(buildJsonLd());
    this.renderer.appendChild(this.document.head, script);
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { SITE } from '../../../core/constants/site';
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

  ngOnInit(): void {
    const pageTitle = `${SITE.name} · ${SITE.title}`;

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: SITE.description });
    this.meta.updateTag({ name: 'author', content: SITE.name });
    this.meta.updateTag({
      name: 'robots',
      content: 'index, follow, max-image-preview:large',
    });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: SITE.name });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({
      property: 'og:description',
      content: SITE.description,
    });
    this.meta.updateTag({ property: 'og:url', content: SITE.domain });
    this.meta.updateTag({
      property: 'og:image',
      content: `${SITE.domain}${SITE.portrait.src}`,
    });
    this.meta.updateTag({
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({
      name: 'twitter:description',
      content: SITE.description,
    });
    this.meta.updateTag({
      name: 'twitter:image',
      content: `${SITE.domain}${SITE.portrait.src}`,
    });
  }
}

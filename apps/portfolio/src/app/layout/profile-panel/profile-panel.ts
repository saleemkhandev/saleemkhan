import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  inject,
} from '@angular/core';
import { trackCvDownload } from '../../core/analytics';
import { SITE } from '../../core/constants/site';
import { ThemeToggle } from '../theme-toggle/theme-toggle';

@Component({
  selector: 'app-profile-panel',
  imports: [ThemeToggle],
  templateUrl: './profile-panel.html',
  styleUrl: './profile-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePanel {
  private readonly document = inject(DOCUMENT);
  protected readonly site = SITE;
  protected readonly trackCvDownload = trackCvDownload;

  protected onNavClick(event: Event, href: string): void {
    if (!href.startsWith('#')) {
      return;
    }

    const target = this.document.getElementById(href.slice(1));
    if (!target) {
      return;
    }

    event.preventDefault();
    const reduceMotion = this.document.defaultView?.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    target.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
    this.document.defaultView?.history.replaceState(
      null,
      '',
      `${this.document.location.pathname}${this.document.location.search}${href}`,
    );
  }
}

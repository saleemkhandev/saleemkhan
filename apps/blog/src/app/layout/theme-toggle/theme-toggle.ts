import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  inject,
  PLATFORM_ID,
} from '@angular/core';

import {
  applyTheme,
  nextTheme,
  persistTheme,
  readDocumentTheme,
  THEME_COLORS,
} from '../../core/theme/theme';

@Component({
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggle {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  protected toggle(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const next = nextTheme(readDocumentTheme(this.document.documentElement));

    persistTheme(next, localStorage);
    applyTheme(
      this.document.documentElement,
      next,
      this.document.querySelector('meta[name="theme-color"]'),
      THEME_COLORS,
    );
  }
}

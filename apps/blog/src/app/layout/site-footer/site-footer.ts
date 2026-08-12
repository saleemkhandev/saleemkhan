import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BLOG_SITE } from '../../core/constants/site';

@Component({
  selector: 'app-site-footer',
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteFooter {
  protected readonly year = new Date().getFullYear();
  protected readonly portfolioUrl = BLOG_SITE.portfolioUrl;
}

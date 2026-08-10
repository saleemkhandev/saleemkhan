import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SITE } from '../../../core/constants/site';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero {
  protected readonly site = SITE;
  protected readonly githubHref = SITE.social[0].href;
}

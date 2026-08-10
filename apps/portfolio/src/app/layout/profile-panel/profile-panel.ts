import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SITE } from '../../core/constants/site';

@Component({
  selector: 'app-profile-panel',
  templateUrl: './profile-panel.html',
  styleUrl: './profile-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePanel {
  protected readonly site = SITE;
  protected readonly githubHref = SITE.social[0].href;
}

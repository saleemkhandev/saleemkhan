import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SITE } from '../../../core/constants/site';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Contact {
  protected readonly site = SITE;
  protected readonly mailto = `mailto:${SITE.email}`;
  protected readonly linkedIn = SITE.social.find(
    (link) => link.label === 'LinkedIn',
  );
}

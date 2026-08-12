import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SITE } from '../../../core/constants/site';

@Component({
  selector: 'app-biography',
  templateUrl: './biography.html',
  styleUrl: './biography.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Biography {
  protected readonly site = SITE;
  protected readonly facts = [
    { label: 'Name', value: SITE.name },
    { label: 'Title', value: SITE.title },
    { label: 'Location', value: SITE.location },
    { label: 'Focus', value: 'Angular · TypeScript · Full-Stack' },
    { label: 'Direction', value: 'Growing toward Staff Engineer' },
    { label: 'Email', value: SITE.email },
    { label: 'GitHub', value: 'saleemkhandev' },
  ] as const;
}

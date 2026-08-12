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
}

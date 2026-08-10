import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SITE } from '../../../core/constants/site';

@Component({
  selector: 'app-engineering-focus',
  templateUrl: './engineering-focus.html',
  styleUrl: './engineering-focus.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EngineeringFocus {
  protected readonly focusAreas = SITE.focusAreas;
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SITE } from '../../../core/constants/site';

@Component({
  selector: 'app-experience',
  templateUrl: './experience.html',
  styleUrl: './experience.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Experience {
  protected readonly roles = SITE.experience;
}

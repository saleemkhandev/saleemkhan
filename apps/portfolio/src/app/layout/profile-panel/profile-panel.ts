import { ChangeDetectionStrategy, Component } from '@angular/core';
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
  protected readonly site = SITE;
}

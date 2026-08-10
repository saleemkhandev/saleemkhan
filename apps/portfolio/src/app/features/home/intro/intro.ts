import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { SITE } from '../../../core/constants/site';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.html',
  styleUrl: './intro.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Intro implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  protected readonly site = SITE;
  protected readonly roles = SITE.rotatingRoles;
  protected readonly activeIndex = signal(0);
  protected readonly animating = signal(false);

  ngOnInit(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) {
      return;
    }

    interval(2600)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.animating.set(true);
        window.setTimeout(() => {
          this.activeIndex.update((index) => (index + 1) % this.roles.length);
          this.animating.set(false);
        }, 220);
      });
  }
}

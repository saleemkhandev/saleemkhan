import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { PLATFORM_NODES } from './platform-nodes';

@Component({
  selector: 'app-platform-scene',
  templateUrl: './platform-scene.html',
  styleUrl: './platform-scene.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlatformScene {
  private readonly platformId = inject(PLATFORM_ID);
  private reduceMotion: boolean | null = null;

  protected readonly nodes = PLATFORM_NODES;

  protected onPointerMove(event: PointerEvent): void {
    if (!this.canTilt(event)) {
      return;
    }

    const root = event.currentTarget as HTMLElement;
    const rect = root.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return;
    }

    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;

    root.style.setProperty('--tilt-x', (-y).toFixed(3));
    root.style.setProperty('--tilt-y', x.toFixed(3));
  }

  protected onPointerLeave(event: PointerEvent): void {
    if (!this.canTilt(event)) {
      return;
    }

    const root = event.currentTarget as HTMLElement;
    root.style.setProperty('--tilt-x', '0');
    root.style.setProperty('--tilt-y', '0');
  }

  private canTilt(event: PointerEvent): boolean {
    if (!isPlatformBrowser(this.platformId) || event.pointerType !== 'mouse') {
      return false;
    }

    this.reduceMotion ??= window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    return !this.reduceMotion;
  }
}

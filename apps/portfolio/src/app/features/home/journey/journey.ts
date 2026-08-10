import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-journey',
  templateUrl: './journey.html',
  styleUrl: './journey.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Journey {
  protected readonly destinations = [
    'A living engineering portfolio',
    'An engineering knowledge base',
    'Architecture case studies',
    'Technical experiments',
    'Interactive playgrounds',
  ] as const;
}

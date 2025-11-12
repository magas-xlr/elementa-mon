import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'glass';

@Component({
  selector: 'lib-card',
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  variant = input<CardVariant>('default');
  hoverable = input<boolean>(false);
  padding = input<boolean>(true);

  // Check if slots have content (simplified for now)
  hasHeaderContent = true;
  hasFooterContent = true;
}

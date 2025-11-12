import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

@Component({
  selector: 'lib-modal',
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent {
  isOpen = input<boolean>(false);
  size = input<ModalSize>('md');
  title = input<string>('');
  closeOnBackdrop = input<boolean>(true);
  showCloseButton = input<boolean>(true);

  closed = output<void>();

  constructor() {
    // Handle body scroll lock when modal is open
    effect(() => {
      if (this.isOpen()) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
  }

  handleClose() {
    this.closed.emit();
  }

  handleBackdropClick() {
    if (this.closeOnBackdrop()) {
      this.handleClose();
    }
  }

  handleContentClick(event: MouseEvent) {
    event.stopPropagation();
  }
}

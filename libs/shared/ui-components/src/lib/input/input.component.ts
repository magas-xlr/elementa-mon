import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
export type InputSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'lib-input',
  imports: [CommonModule, FormsModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent {
  // Two-way binding
  value = model<string>('');

  // Input properties
  type = input<InputType>('text');
  size = input<InputSize>('md');
  placeholder = input<string>('');
  label = input<string>('');
  helperText = input<string>('');
  error = input<string>('');
  disabled = input<boolean>(false);
  required = input<boolean>(false);
  icon = input<string>('');
  maxLength = input<number | undefined>(undefined);

  // Outputs
  focused = output<FocusEvent>();
  blurred = output<FocusEvent>();

  onFocus(event: FocusEvent) {
    this.focused.emit(event);
  }

  onBlur(event: FocusEvent) {
    this.blurred.emit(event);
  }
}

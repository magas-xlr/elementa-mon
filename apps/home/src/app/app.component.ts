import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  ButtonComponent,
  CardComponent,
  InputComponent,
  ModalComponent,
} from '@elementamon/shared-ui-components';

@Component({
  imports: [RouterModule, ButtonComponent, CardComponent, ModalComponent, InputComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'ElementaMon - Home';

  // Modal state
  isModalOpen = signal(false);

  // Input state
  playerName = signal('');

  openModal() {
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  handleButtonClick() {
    console.log('Button clicked!');
  }
}

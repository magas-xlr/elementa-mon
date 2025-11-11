import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';

@Component({
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'ElementaMon';

  routes = [
    { path: '/home', label: 'Home', icon: '🏠' },
    { path: '/deck-builder', label: 'Deck Builder', icon: '🎴' },
    { path: '/battle', label: 'Battle', icon: '⚔️' },
    { path: '/world-map', label: 'World Map', icon: '🗺️' },
    { path: '/inventory', label: 'Inventory', icon: '🎒' },
    { path: '/avatar-customization', label: 'Avatar', icon: '👤' },
  ];
}

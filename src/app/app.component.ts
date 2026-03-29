import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <app-header />
    <main class="main-content">
      <router-outlet />
    </main>
    <footer class="footer">
      <p>© 2024 ShopEase. All rights reserved.</p>
    </footer>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .main-content {
      flex: 1;
      background: #f7fafc;
    }

    .footer {
      background: #1a1a2e;
      color: #a0aec0;
      text-align: center;
      padding: 1.5rem;
    }

    .footer p {
      margin: 0;
      font-size: 0.9rem;
    }
  `]
})
export class AppComponent {}

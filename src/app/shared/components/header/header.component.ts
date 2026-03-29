import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CurrencyPipe],
  template: `
    <header class="header">
      <div class="header-container">
        <a routerLink="/" class="logo">
          <span class="logo-icon">🛒</span>
          <span class="logo-text">ShopEase</span>
        </a>

        <nav class="nav-links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
            Products
          </a>
          <a routerLink="/orders" routerLinkActive="active">
            My Orders
          </a>
          <a routerLink="/track-order" routerLinkActive="active">
            Track Order
          </a>
        </nav>

        <div class="header-actions">
          <a routerLink="/cart" class="cart-link">
            <span class="cart-icon">🛒</span>
            @if (cartService.totalItems() > 0) {
              <span class="cart-badge">{{ cartService.totalItems() }}</span>
            }
            <span class="cart-total">{{ cartService.subtotal() | currency }}</span>
          </a>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 1rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      font-size: 1.5rem;
      font-weight: 700;
      color: #1a1a2e;
    }

    .logo-icon {
      font-size: 1.75rem;
    }

    .logo-text {
      background: linear-gradient(135deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .nav-links {
      display: flex;
      gap: 2rem;
    }

    .nav-links a {
      text-decoration: none;
      color: #4a5568;
      font-weight: 500;
      padding: 0.5rem 0;
      position: relative;
      transition: color 0.2s;
    }

    .nav-links a:hover,
    .nav-links a.active {
      color: #667eea;
    }

    .nav-links a.active::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 1px;
    }

    .cart-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      color: #1a1a2e;
      background: #f7fafc;
      padding: 0.75rem 1.25rem;
      border-radius: 50px;
      transition: all 0.2s;
      position: relative;
    }

    .cart-link:hover {
      background: #edf2f7;
      transform: translateY(-1px);
    }

    .cart-icon {
      font-size: 1.25rem;
    }

    .cart-badge {
      position: absolute;
      top: -4px;
      left: 24px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      font-size: 0.7rem;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 10px;
      min-width: 18px;
      text-align: center;
    }

    .cart-total {
      font-weight: 600;
      color: #667eea;
    }

    @media (max-width: 768px) {
      .header-container {
        padding: 1rem;
      }

      .nav-links {
        display: none;
      }

      .logo-text {
        display: none;
      }
    }
  `]
})
export class HeaderComponent {
  cartService = inject(CartService);
}

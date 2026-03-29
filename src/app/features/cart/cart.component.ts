import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="cart-page">
      <h1>Shopping Cart</h1>

      @if (cartService.isEmpty()) {
        <div class="empty-cart">
          <div class="empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any items yet.</p>
          <a routerLink="/" class="continue-shopping-btn">Continue Shopping</a>
        </div>
      } @else {
        <div class="cart-layout">
          <div class="cart-items">
            @for (item of cartService.items(); track item.product.id) {
              <div class="cart-item">
                <img [src]="item.product.imageUrl" [alt]="item.product.name" class="item-image" />
                
                <div class="item-details">
                  <a [routerLink]="['/products', item.product.id]" class="item-name">
                    {{ item.product.name }}
                  </a>
                  <span class="item-category">{{ item.product.category }}</span>
                  <span class="item-price">{{ item.product.price | currency }} each</span>
                </div>

                <div class="item-quantity">
                  <button 
                    (click)="updateQuantity(item.product.id, item.quantity - 1)"
                    [disabled]="item.quantity <= 1"
                  >
                    −
                  </button>
                  <span>{{ item.quantity }}</span>
                  <button 
                    (click)="updateQuantity(item.product.id, item.quantity + 1)"
                    [disabled]="item.quantity >= item.product.stock"
                  >
                    +
                  </button>
                </div>

                <div class="item-total">
                  {{ item.product.price * item.quantity | currency }}
                </div>

                <button class="remove-btn" (click)="removeItem(item.product.id)">
                  ✕
                </button>
              </div>
            }
          </div>

          <div class="cart-summary">
            <h2>Order Summary</h2>
            
            <div class="summary-row">
              <span>Subtotal ({{ cartService.totalItems() }} items)</span>
              <span>{{ cartService.subtotal() | currency }}</span>
            </div>
            
            <div class="summary-row">
              <span>Tax (8%)</span>
              <span>{{ cartService.tax() | currency }}</span>
            </div>
            
            <div class="summary-row">
              <span>Shipping</span>
              <span>
                @if (cartService.shipping() === 0) {
                  <span class="free-shipping">FREE</span>
                } @else {
                  {{ cartService.shipping() | currency }}
                }
              </span>
            </div>

            @if (cartService.subtotal() < 100) {
              <div class="shipping-progress">
                <p>Add {{ 100 - cartService.subtotal() | currency }} more for free shipping!</p>
                <div class="progress-bar">
                  <div class="progress" [style.width.%]="cartService.subtotal()"></div>
                </div>
              </div>
            }

            <div class="summary-total">
              <span>Total</span>
              <span>{{ cartService.total() | currency }}</span>
            </div>

            <a routerLink="/checkout" class="checkout-btn">
              Proceed to Checkout
            </a>

            <a routerLink="/" class="continue-shopping">
              ← Continue Shopping
            </a>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .cart-page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .cart-page > h1 {
      font-size: 2rem;
      color: #1a1a2e;
      margin-bottom: 2rem;
    }

    /* Empty Cart */
    .empty-cart {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 20px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-cart h2 {
      color: #1a1a2e;
      margin-bottom: 0.5rem;
    }

    .empty-cart p {
      color: #718096;
      margin-bottom: 2rem;
    }

    .continue-shopping-btn {
      display: inline-block;
      padding: 1rem 2rem;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      text-decoration: none;
      border-radius: 10px;
      font-weight: 600;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .continue-shopping-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }

    /* Cart Layout */
    .cart-layout {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 2rem;
      align-items: start;
    }

    /* Cart Items */
    .cart-items {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .cart-item {
      display: grid;
      grid-template-columns: 100px 1fr auto auto auto;
      gap: 1.5rem;
      align-items: center;
      background: white;
      padding: 1.5rem;
      border-radius: 16px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .item-image {
      width: 100px;
      height: 100px;
      object-fit: cover;
      border-radius: 12px;
    }

    .item-details {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .item-name {
      font-weight: 600;
      color: #1a1a2e;
      text-decoration: none;
      font-size: 1.1rem;
    }

    .item-name:hover {
      color: #667eea;
    }

    .item-category {
      font-size: 0.85rem;
      color: #718096;
    }

    .item-price {
      font-size: 0.9rem;
      color: #4a5568;
    }

    .item-quantity {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }

    .item-quantity button {
      width: 36px;
      height: 36px;
      border: none;
      background: #f7fafc;
      cursor: pointer;
      font-size: 1.1rem;
      transition: background 0.2s;
    }

    .item-quantity button:hover:not(:disabled) {
      background: #e2e8f0;
    }

    .item-quantity button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .item-quantity span {
      width: 40px;
      text-align: center;
      font-weight: 600;
    }

    .item-total {
      font-size: 1.1rem;
      font-weight: 700;
      color: #1a1a2e;
      min-width: 90px;
      text-align: right;
    }

    .remove-btn {
      width: 36px;
      height: 36px;
      border: none;
      background: #fed7d7;
      color: #c53030;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .remove-btn:hover {
      background: #fc8181;
      color: white;
    }

    /* Cart Summary */
    .cart-summary {
      background: white;
      border-radius: 20px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      position: sticky;
      top: 100px;
    }

    .cart-summary h2 {
      font-size: 1.25rem;
      color: #1a1a2e;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1rem;
      color: #4a5568;
    }

    .free-shipping {
      color: #38a169;
      font-weight: 600;
    }

    .shipping-progress {
      background: #f0fff4;
      padding: 1rem;
      border-radius: 10px;
      margin: 1rem 0;
    }

    .shipping-progress p {
      font-size: 0.9rem;
      color: #276749;
      margin-bottom: 0.5rem;
    }

    .progress-bar {
      height: 6px;
      background: #c6f6d5;
      border-radius: 3px;
      overflow: hidden;
    }

    .progress {
      height: 100%;
      background: #38a169;
      transition: width 0.3s;
    }

    .summary-total {
      display: flex;
      justify-content: space-between;
      font-size: 1.25rem;
      font-weight: 700;
      color: #1a1a2e;
      padding-top: 1rem;
      margin-top: 1rem;
      border-top: 2px solid #e2e8f0;
    }

    .checkout-btn {
      display: block;
      width: 100%;
      padding: 1rem;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      text-align: center;
      text-decoration: none;
      border-radius: 10px;
      font-weight: 600;
      margin-top: 1.5rem;
      transition: all 0.2s;
    }

    .checkout-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }

    .continue-shopping {
      display: block;
      text-align: center;
      margin-top: 1rem;
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }

    .continue-shopping:hover {
      text-decoration: underline;
    }

    @media (max-width: 968px) {
      .cart-layout {
        grid-template-columns: 1fr;
      }

      .cart-summary {
        position: static;
      }

      .cart-item {
        grid-template-columns: 80px 1fr;
        gap: 1rem;
      }

      .item-quantity,
      .item-total,
      .remove-btn {
        grid-column: 2;
      }

      .item-image {
        width: 80px;
        height: 80px;
      }
    }
  `]
})
export class CartComponent {
  cartService = inject(CartService);

  updateQuantity(productId: number, quantity: number): void {
    this.cartService.updateQuantity(productId, quantity);
  }

  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId);
  }
}

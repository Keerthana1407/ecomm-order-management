import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { Address, PaymentMethod, CreateOrderRequest } from '../../core/models/order.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoadingSpinnerComponent],
  template: `
    @if (orderService.isLoading()) {
      <app-loading-spinner [overlay]="true" message="Processing your order..." />
    }

    <div class="checkout-page">
      <h1>Checkout</h1>

      @if (cartService.isEmpty()) {
        <div class="empty-cart">
          <p>Your cart is empty. Add some items before checking out.</p>
          <a routerLink="/" class="back-btn">Browse Products</a>
        </div>
      } @else if (orderComplete()) {
        <div class="order-complete">
          <div class="success-icon">✓</div>
          <h2>Order Placed Successfully!</h2>
          <p>Your order number is: <strong>{{ completedOrder()?.orderNumber }}</strong></p>
          <p>Estimated delivery: {{ completedOrder()?.estimatedDelivery | date:'fullDate' }}</p>
          <div class="complete-actions">
            <a [routerLink]="['/orders', completedOrder()?.id]" class="view-order-btn">
              View Order Details
            </a>
            <a routerLink="/" class="continue-btn">Continue Shopping</a>
          </div>
        </div>
      } @else {
        <div class="checkout-layout">
          <form class="checkout-form" (ngSubmit)="placeOrder()">
            <!-- Shipping Address -->
            <section class="form-section">
              <h2>Shipping Address</h2>
              <div class="form-grid">
                <div class="form-group full-width">
                  <label>Full Name *</label>
                  <input type="text" [(ngModel)]="shippingAddress.fullName" name="shippingName" required />
                </div>
                <div class="form-group full-width">
                  <label>Street Address *</label>
                  <input type="text" [(ngModel)]="shippingAddress.street" name="shippingStreet" required />
                </div>
                <div class="form-group">
                  <label>City *</label>
                  <input type="text" [(ngModel)]="shippingAddress.city" name="shippingCity" required />
                </div>
                <div class="form-group">
                  <label>State *</label>
                  <input type="text" [(ngModel)]="shippingAddress.state" name="shippingState" required />
                </div>
                <div class="form-group">
                  <label>ZIP Code *</label>
                  <input type="text" [(ngModel)]="shippingAddress.zipCode" name="shippingZip" required />
                </div>
                <div class="form-group">
                  <label>Country *</label>
                  <input type="text" [(ngModel)]="shippingAddress.country" name="shippingCountry" required />
                </div>
                <div class="form-group full-width">
                  <label>Phone Number *</label>
                  <input type="tel" [(ngModel)]="shippingAddress.phone" name="shippingPhone" required />
                </div>
              </div>

              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="sameAsBilling" name="sameAsBilling" />
                Billing address same as shipping
              </label>
            </section>

            <!-- Billing Address -->
            @if (!sameAsBilling) {
              <section class="form-section">
                <h2>Billing Address</h2>
                <div class="form-grid">
                  <div class="form-group full-width">
                    <label>Full Name *</label>
                    <input type="text" [(ngModel)]="billingAddress.fullName" name="billingName" required />
                  </div>
                  <div class="form-group full-width">
                    <label>Street Address *</label>
                    <input type="text" [(ngModel)]="billingAddress.street" name="billingStreet" required />
                  </div>
                  <div class="form-group">
                    <label>City *</label>
                    <input type="text" [(ngModel)]="billingAddress.city" name="billingCity" required />
                  </div>
                  <div class="form-group">
                    <label>State *</label>
                    <input type="text" [(ngModel)]="billingAddress.state" name="billingState" required />
                  </div>
                  <div class="form-group">
                    <label>ZIP Code *</label>
                    <input type="text" [(ngModel)]="billingAddress.zipCode" name="billingZip" required />
                  </div>
                  <div class="form-group">
                    <label>Country *</label>
                    <input type="text" [(ngModel)]="billingAddress.country" name="billingCountry" required />
                  </div>
                  <div class="form-group full-width">
                    <label>Phone Number *</label>
                    <input type="tel" [(ngModel)]="billingAddress.phone" name="billingPhone" required />
                  </div>
                </div>
              </section>
            }

            <!-- Payment Method -->
            <section class="form-section">
              <h2>Payment Method</h2>
              <div class="payment-options">
                <label class="payment-option" [class.selected]="paymentType === 'credit-card'">
                  <input type="radio" [(ngModel)]="paymentType" name="paymentType" value="credit-card" />
                  <span class="payment-icon">💳</span>
                  <span>Credit Card</span>
                </label>
                <label class="payment-option" [class.selected]="paymentType === 'debit-card'">
                  <input type="radio" [(ngModel)]="paymentType" name="paymentType" value="debit-card" />
                  <span class="payment-icon">🏦</span>
                  <span>Debit Card</span>
                </label>
                <label class="payment-option" [class.selected]="paymentType === 'paypal'">
                  <input type="radio" [(ngModel)]="paymentType" name="paymentType" value="paypal" />
                  <span class="payment-icon">🅿️</span>
                  <span>PayPal</span>
                </label>
                <label class="payment-option" [class.selected]="paymentType === 'cod'">
                  <input type="radio" [(ngModel)]="paymentType" name="paymentType" value="cod" />
                  <span class="payment-icon">💵</span>
                  <span>Cash on Delivery</span>
                </label>
              </div>

              @if (paymentType === 'credit-card' || paymentType === 'debit-card') {
                <div class="card-details">
                  <div class="form-group full-width">
                    <label>Card Number</label>
                    <input type="text" placeholder="1234 5678 9012 3456" maxlength="19" />
                  </div>
                  <div class="form-group">
                    <label>Expiry Date</label>
                    <input type="text" placeholder="MM/YY" maxlength="5" />
                  </div>
                  <div class="form-group">
                    <label>CVV</label>
                    <input type="text" placeholder="123" maxlength="4" />
                  </div>
                </div>
              }
            </section>

            <button type="submit" class="place-order-btn" [disabled]="!isFormValid()">
              Place Order • {{ cartService.total() | currency }}
            </button>
          </form>

          <!-- Order Summary -->
          <aside class="order-summary">
            <h2>Order Summary</h2>
            
            <div class="summary-items">
              @for (item of cartService.items(); track item.product.id) {
                <div class="summary-item">
                  <img [src]="item.product.imageUrl" [alt]="item.product.name" />
                  <div class="summary-item-info">
                    <span class="summary-item-name">{{ item.product.name }}</span>
                    <span class="summary-item-qty">Qty: {{ item.quantity }}</span>
                  </div>
                  <span class="summary-item-price">
                    {{ item.product.price * item.quantity | currency }}
                  </span>
                </div>
              }
            </div>

            <div class="summary-totals">
              <div class="summary-row">
                <span>Subtotal</span>
                <span>{{ cartService.subtotal() | currency }}</span>
              </div>
              <div class="summary-row">
                <span>Tax</span>
                <span>{{ cartService.tax() | currency }}</span>
              </div>
              <div class="summary-row">
                <span>Shipping</span>
                <span>
                  @if (cartService.shipping() === 0) {
                    FREE
                  } @else {
                    {{ cartService.shipping() | currency }}
                  }
                </span>
              </div>
              <div class="summary-row total">
                <span>Total</span>
                <span>{{ cartService.total() | currency }}</span>
              </div>
            </div>

            <a routerLink="/cart" class="edit-cart-link">← Edit Cart</a>
          </aside>
        </div>
      }
    </div>
  `,
  styles: [`
    .checkout-page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .checkout-page > h1 {
      font-size: 2rem;
      color: #1a1a2e;
      margin-bottom: 2rem;
    }

    /* Empty Cart */
    .empty-cart {
      text-align: center;
      padding: 3rem;
      background: white;
      border-radius: 16px;
    }

    .back-btn {
      display: inline-block;
      margin-top: 1rem;
      padding: 0.75rem 1.5rem;
      background: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 8px;
    }

    /* Order Complete */
    .order-complete {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 20px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }

    .success-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #48bb78, #38a169);
      color: white;
      font-size: 2.5rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
    }

    .order-complete h2 {
      color: #1a1a2e;
      margin-bottom: 1rem;
    }

    .order-complete p {
      color: #4a5568;
      margin-bottom: 0.5rem;
    }

    .complete-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 2rem;
    }

    .view-order-btn {
      padding: 1rem 2rem;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      text-decoration: none;
      border-radius: 10px;
      font-weight: 600;
    }

    .continue-btn {
      padding: 1rem 2rem;
      background: #f7fafc;
      color: #4a5568;
      text-decoration: none;
      border-radius: 10px;
      font-weight: 600;
      border: 2px solid #e2e8f0;
    }

    /* Checkout Layout */
    .checkout-layout {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 2rem;
      align-items: start;
    }

    /* Form Sections */
    .form-section {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .form-section h2 {
      font-size: 1.25rem;
      color: #1a1a2e;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-group label {
      font-size: 0.9rem;
      font-weight: 500;
      color: #4a5568;
    }

    .form-group input {
      padding: 0.75rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    .form-group input:focus {
      outline: none;
      border-color: #667eea;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1rem;
      cursor: pointer;
      color: #4a5568;
    }

    .checkbox-label input {
      width: 18px;
      height: 18px;
      accent-color: #667eea;
    }

    /* Payment Options */
    .payment-options {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .payment-option {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .payment-option:hover {
      border-color: #667eea;
    }

    .payment-option.selected {
      border-color: #667eea;
      background: #f7f7ff;
    }

    .payment-option input {
      display: none;
    }

    .payment-icon {
      font-size: 1.5rem;
    }

    .card-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e2e8f0;
    }

    /* Place Order Button */
    .place-order-btn {
      width: 100%;
      padding: 1.25rem;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .place-order-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }

    .place-order-btn:disabled {
      background: #e2e8f0;
      color: #a0aec0;
      cursor: not-allowed;
    }

    /* Order Summary */
    .order-summary {
      background: white;
      border-radius: 20px;
      padding: 1.5rem;
      position: sticky;
      top: 100px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }

    .order-summary h2 {
      font-size: 1.25rem;
      color: #1a1a2e;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .summary-items {
      max-height: 300px;
      overflow-y: auto;
      margin-bottom: 1.5rem;
    }

    .summary-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid #f7fafc;
    }

    .summary-item img {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 8px;
    }

    .summary-item-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .summary-item-name {
      font-size: 0.9rem;
      font-weight: 500;
      color: #1a1a2e;
    }

    .summary-item-qty {
      font-size: 0.8rem;
      color: #718096;
    }

    .summary-item-price {
      font-weight: 600;
      color: #1a1a2e;
    }

    .summary-totals {
      padding-top: 1rem;
      border-top: 1px solid #e2e8f0;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.75rem;
      color: #4a5568;
    }

    .summary-row.total {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1a1a2e;
      padding-top: 0.75rem;
      margin-top: 0.75rem;
      border-top: 2px solid #e2e8f0;
    }

    .edit-cart-link {
      display: block;
      text-align: center;
      margin-top: 1rem;
      color: #667eea;
      text-decoration: none;
    }

    .edit-cart-link:hover {
      text-decoration: underline;
    }

    @media (max-width: 968px) {
      .checkout-layout {
        grid-template-columns: 1fr;
      }

      .order-summary {
        position: static;
        order: -1;
      }

      .payment-options {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 600px) {
      .checkout-page {
        padding: 1rem;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .form-group.full-width {
        grid-column: 1;
      }

      .card-details {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CheckoutComponent {
  cartService = inject(CartService);
  orderService = inject(OrderService);
  private router = inject(Router);

  orderComplete = signal(false);
  completedOrder = this.orderService.activeOrder;

  shippingAddress: Address = {
    fullName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: ''
  };

  billingAddress: Address = {
    fullName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: ''
  };

  sameAsBilling = true;
  paymentType: 'credit-card' | 'debit-card' | 'paypal' | 'cod' = 'credit-card';

  isFormValid(): boolean {
    const shippingValid = !!(
      this.shippingAddress.fullName &&
      this.shippingAddress.street &&
      this.shippingAddress.city &&
      this.shippingAddress.state &&
      this.shippingAddress.zipCode &&
      this.shippingAddress.phone
    );

    if (!shippingValid) return false;

    if (!this.sameAsBilling) {
      const billingValid = !!(
        this.billingAddress.fullName &&
        this.billingAddress.street &&
        this.billingAddress.city &&
        this.billingAddress.state &&
        this.billingAddress.zipCode &&
        this.billingAddress.phone
      );
      if (!billingValid) return false;
    }

    return true;
  }

  placeOrder(): void {
    if (!this.isFormValid()) return;

    const request: CreateOrderRequest = {
      items: this.cartService.items(),
      shippingAddress: this.shippingAddress,
      billingAddress: this.sameAsBilling ? this.shippingAddress : this.billingAddress,
      paymentMethod: {
        type: this.paymentType,
        cardLastFour: this.paymentType.includes('card') ? '4242' : undefined,
        cardBrand: this.paymentType.includes('card') ? 'Visa' : undefined
      }
    };

    this.orderService.createOrder(request).subscribe({
      next: () => {
        this.orderComplete.set(true);
      },
      error: (err) => {
        console.error('Order failed:', err);
        alert('Failed to place order. Please try again.');
      }
    });
  }
}

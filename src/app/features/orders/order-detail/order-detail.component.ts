import { Component, inject, OnInit, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { OrderStatusHistory } from '../../../core/models/order.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  template: `
    @if (orderService.isLoading()) {
      <app-loading-spinner [overlay]="true" message="Loading order..." />
    }

    @if (order(); as o) {
      <div class="order-detail-page">
        <nav class="breadcrumb">
          <a routerLink="/orders">My Orders</a>
          <span>/</span>
          <span>{{ o.orderNumber }}</span>
        </nav>

        <div class="order-header-section">
          <div>
            <h1>Order {{ o.orderNumber }}</h1>
            <p class="order-date">Placed on {{ o.createdAt | date:'fullDate' }}</p>
          </div>
          <span class="order-status" [class]="o.status">
            {{ formatStatus(o.status) }}
          </span>
        </div>

        <!-- Order Tracking -->
        <section class="tracking-section">
          <h2>Order Status</h2>
          <div class="tracking-timeline">
            @for (step of statusHistory(); track step.status; let i = $index) {
              <div class="timeline-step" [class.completed]="isStepCompleted(step.status)" [class.current]="o.status === step.status">
                <div class="step-indicator">
                  @if (isStepCompleted(step.status)) {
                    <span class="check">✓</span>
                  } @else {
                    <span class="number">{{ i + 1 }}</span>
                  }
                </div>
                <div class="step-content">
                  <span class="step-title">{{ formatStatus(step.status) }}</span>
                  <span class="step-date">{{ step.timestamp | date:'short' }}</span>
                  <span class="step-description">{{ step.description }}</span>
                </div>
              </div>
            }
          </div>
          @if (o.estimatedDelivery) {
            <p class="delivery-estimate">
              Estimated Delivery: <strong>{{ o.estimatedDelivery | date:'fullDate' }}</strong>
            </p>
          }
        </section>

        <div class="order-content">
          <!-- Order Items -->
          <section class="items-section">
            <h2>Items ({{ o.items.length }})</h2>
            <div class="items-list">
              @for (item of o.items; track item.productId) {
                <div class="order-item">
                  <img [src]="item.productImage" [alt]="item.productName" />
                  <div class="item-info">
                    <a [routerLink]="['/products', item.productId]" class="item-name">
                      {{ item.productName }}
                    </a>
                    <span class="item-price">{{ item.price | currency }} × {{ item.quantity }}</span>
                  </div>
                  <span class="item-total">{{ item.total | currency }}</span>
                </div>
              }
            </div>
          </section>

          <!-- Order Summary & Addresses -->
          <aside class="order-sidebar">
            <div class="summary-card">
              <h3>Order Summary</h3>
              <div class="summary-row">
                <span>Subtotal</span>
                <span>{{ o.subtotal | currency }}</span>
              </div>
              <div class="summary-row">
                <span>Tax</span>
                <span>{{ o.tax | currency }}</span>
              </div>
              <div class="summary-row">
                <span>Shipping</span>
                <span>{{ o.shipping === 0 ? 'FREE' : (o.shipping | currency) }}</span>
              </div>
              <div class="summary-row total">
                <span>Total</span>
                <span>{{ o.total | currency }}</span>
              </div>
            </div>

            <div class="address-card">
              <h3>Shipping Address</h3>
              <p>{{ o.shippingAddress.fullName }}</p>
              <p>{{ o.shippingAddress.street }}</p>
              <p>{{ o.shippingAddress.city }}, {{ o.shippingAddress.state }} {{ o.shippingAddress.zipCode }}</p>
              <p>{{ o.shippingAddress.country }}</p>
              <p>{{ o.shippingAddress.phone }}</p>
            </div>

            <div class="payment-card">
              <h3>Payment Method</h3>
              <p>
                @switch (o.paymentMethod.type) {
                  @case ('credit-card') { 💳 Credit Card }
                  @case ('debit-card') { 🏦 Debit Card }
                  @case ('paypal') { 🅿️ PayPal }
                  @case ('cod') { 💵 Cash on Delivery }
                }
                @if (o.paymentMethod.cardLastFour) {
                  •••• {{ o.paymentMethod.cardLastFour }}
                }
              </p>
            </div>

            @if (canCancel(o.status)) {
              <button class="cancel-btn" (click)="cancelOrder()">
                Cancel Order
              </button>
            }
          </aside>
        </div>
      </div>
    }
  `,
  styles: [`
    .order-detail-page {
      max-width: 1100px;
      margin: 0 auto;
      padding: 2rem;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
      color: #718096;
    }

    .breadcrumb a {
      color: #667eea;
      text-decoration: none;
    }

    .order-header-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
    }

    .order-header-section h1 {
      font-size: 1.75rem;
      color: #1a1a2e;
      margin-bottom: 0.25rem;
    }

    .order-date {
      color: #718096;
    }

    .order-status {
      padding: 0.5rem 1.25rem;
      border-radius: 20px;
      font-weight: 600;
      text-transform: capitalize;
    }

    .order-status.pending { background: #fef3c7; color: #92400e; }
    .order-status.confirmed,
    .order-status.processing { background: #dbeafe; color: #1e40af; }
    .order-status.shipped,
    .order-status.out-for-delivery { background: #e0e7ff; color: #3730a3; }
    .order-status.delivered { background: #d1fae5; color: #065f46; }
    .order-status.cancelled,
    .order-status.returned { background: #fee2e2; color: #991b1b; }

    /* Tracking Section */
    .tracking-section {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .tracking-section h2 {
      font-size: 1.1rem;
      color: #1a1a2e;
      margin-bottom: 1.5rem;
    }

    .tracking-timeline {
      display: flex;
      justify-content: space-between;
      position: relative;
    }

    .tracking-timeline::before {
      content: '';
      position: absolute;
      top: 20px;
      left: 40px;
      right: 40px;
      height: 2px;
      background: #e2e8f0;
    }

    .timeline-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      flex: 1;
      position: relative;
    }

    .step-indicator {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: #718096;
      margin-bottom: 0.75rem;
      z-index: 1;
    }

    .timeline-step.completed .step-indicator {
      background: #48bb78;
      color: white;
    }

    .timeline-step.current .step-indicator {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
    }

    .step-content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .step-title {
      font-weight: 600;
      color: #1a1a2e;
      font-size: 0.85rem;
    }

    .step-date {
      font-size: 0.75rem;
      color: #718096;
    }

    .step-description {
      font-size: 0.75rem;
      color: #a0aec0;
      display: none;
    }

    .delivery-estimate {
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid #e2e8f0;
      color: #4a5568;
    }

    /* Order Content */
    .order-content {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: 2rem;
      align-items: start;
    }

    /* Items Section */
    .items-section {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .items-section h2 {
      font-size: 1.1rem;
      color: #1a1a2e;
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .order-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 0;
      border-bottom: 1px solid #f7fafc;
    }

    .order-item:last-child {
      border-bottom: none;
    }

    .order-item img {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 10px;
    }

    .item-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .item-name {
      font-weight: 600;
      color: #1a1a2e;
      text-decoration: none;
    }

    .item-name:hover {
      color: #667eea;
    }

    .item-price {
      font-size: 0.9rem;
      color: #718096;
    }

    .item-total {
      font-weight: 700;
      color: #1a1a2e;
      font-size: 1.1rem;
    }

    /* Sidebar Cards */
    .order-sidebar {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .summary-card,
    .address-card,
    .payment-card {
      background: white;
      border-radius: 12px;
      padding: 1.25rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .summary-card h3,
    .address-card h3,
    .payment-card h3 {
      font-size: 0.9rem;
      color: #718096;
      margin-bottom: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      color: #4a5568;
    }

    .summary-row.total {
      font-weight: 700;
      color: #1a1a2e;
      font-size: 1.1rem;
      padding-top: 0.75rem;
      margin-top: 0.75rem;
      border-top: 2px solid #e2e8f0;
    }

    .address-card p,
    .payment-card p {
      color: #4a5568;
      line-height: 1.6;
      margin: 0;
    }

    .cancel-btn {
      width: 100%;
      padding: 0.875rem;
      background: #fee2e2;
      color: #c53030;
      border: none;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .cancel-btn:hover {
      background: #fc8181;
      color: white;
    }

    @media (max-width: 900px) {
      .order-content {
        grid-template-columns: 1fr;
      }

      .tracking-timeline {
        flex-direction: column;
        gap: 1rem;
      }

      .tracking-timeline::before {
        display: none;
      }

      .timeline-step {
        flex-direction: row;
        text-align: left;
        gap: 1rem;
      }

      .step-indicator {
        margin-bottom: 0;
      }
    }

    @media (max-width: 600px) {
      .order-detail-page {
        padding: 1rem;
      }

      .order-header-section {
        flex-direction: column;
        gap: 1rem;
      }

      .order-item img {
        width: 60px;
        height: 60px;
      }
    }
  `]
})
export class OrderDetailComponent implements OnInit {
  @Input() id!: string;

  orderService = inject(OrderService);
  order = this.orderService.activeOrder;
  statusHistory = signal<OrderStatusHistory[]>([]);

  private statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'out-for-delivery', 'delivered'];

  ngOnInit(): void {
    const orderId = parseInt(this.id, 10);
    this.orderService.getOrderById(orderId).subscribe();
    this.orderService.getOrderStatusHistory(orderId).subscribe(history =>
      this.statusHistory.set(history)
    );
  }

  formatStatus(status: string): string {
    return status.replace(/-/g, ' ');
  }

  isStepCompleted(status: string): boolean {
    const order = this.order();
    if (!order) return false;
    const currentIndex = this.statusOrder.indexOf(order.status);
    const stepIndex = this.statusOrder.indexOf(status);
    return stepIndex < currentIndex;
  }

  canCancel(status: string): boolean {
    return ['pending', 'confirmed'].includes(status);
  }

  cancelOrder(): void {
    const order = this.order();
    if (order && confirm('Are you sure you want to cancel this order?')) {
      this.orderService.cancelOrder(order.id).subscribe();
    }
  }
}

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="tracking-page">
      <div class="tracking-card">
        <h1>Track Your Order</h1>
        <p class="subtitle">Enter your order number to track your shipment</p>

        <form (ngSubmit)="trackOrder()" class="tracking-form">
          <div class="input-group">
            <input
              type="text"
              [(ngModel)]="orderNumber"
              name="orderNumber"
              placeholder="Enter order number (e.g., ORD-1234567890-1001)"
              required
            />
            <button type="submit" [disabled]="!orderNumber || isLoading()">
              @if (isLoading()) {
                Searching...
              } @else {
                Track Order
              }
            </button>
          </div>
        </form>

        @if (error()) {
          <div class="error-message">
            {{ error() }}
          </div>
        }

        @if (trackedOrder(); as order) {
          <div class="tracking-result">
            <div class="result-header">
              <div>
                <h2>{{ order.orderNumber }}</h2>
                <p>Placed on {{ order.createdAt | date:'fullDate' }}</p>
              </div>
              <span class="status" [class]="order.status">
                {{ formatStatus(order.status) }}
              </span>
            </div>

            <div class="tracking-progress">
              @for (step of trackingSteps; track step.status) {
                <div class="progress-step" [class.completed]="isCompleted(order, step.status)" [class.current]="order.status === step.status">
                  <div class="step-dot"></div>
                  <div class="step-label">{{ step.label }}</div>
                </div>
              }
            </div>

            @if (order.estimatedDelivery) {
              <p class="delivery-date">
                Estimated Delivery: <strong>{{ order.estimatedDelivery | date:'fullDate' }}</strong>
              </p>
            }

            <a [routerLink]="['/orders', order.id]" class="view-details-link">
              View Full Order Details →
            </a>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .tracking-page {
      min-height: 60vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .tracking-card {
      background: white;
      border-radius: 20px;
      padding: 3rem;
      width: 100%;
      max-width: 600px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }

    .tracking-card h1 {
      font-size: 1.75rem;
      color: #1a1a2e;
      margin-bottom: 0.5rem;
      text-align: center;
    }

    .subtitle {
      text-align: center;
      color: #718096;
      margin-bottom: 2rem;
    }

    .tracking-form {
      margin-bottom: 1.5rem;
    }

    .input-group {
      display: flex;
      gap: 0.75rem;
    }

    .input-group input {
      flex: 1;
      padding: 1rem 1.25rem;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      font-size: 1rem;
    }

    .input-group input:focus {
      outline: none;
      border-color: #667eea;
    }

    .input-group button {
      padding: 1rem 1.5rem;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s;
    }

    .input-group button:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .input-group button:disabled {
      background: #e2e8f0;
      color: #a0aec0;
      cursor: not-allowed;
    }

    .error-message {
      background: #fee2e2;
      color: #c53030;
      padding: 1rem;
      border-radius: 8px;
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .tracking-result {
      padding-top: 1.5rem;
      border-top: 1px solid #e2e8f0;
    }

    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
    }

    .result-header h2 {
      font-size: 1.1rem;
      color: #1a1a2e;
      margin-bottom: 0.25rem;
    }

    .result-header p {
      font-size: 0.9rem;
      color: #718096;
    }

    .status {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: capitalize;
    }

    .status.pending { background: #fef3c7; color: #92400e; }
    .status.confirmed,
    .status.processing { background: #dbeafe; color: #1e40af; }
    .status.shipped,
    .status.out-for-delivery { background: #e0e7ff; color: #3730a3; }
    .status.delivered { background: #d1fae5; color: #065f46; }

    .tracking-progress {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1.5rem;
      position: relative;
    }

    .tracking-progress::before {
      content: '';
      position: absolute;
      top: 10px;
      left: 10%;
      right: 10%;
      height: 2px;
      background: #e2e8f0;
    }

    .progress-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      z-index: 1;
    }

    .step-dot {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #e2e8f0;
      margin-bottom: 0.5rem;
    }

    .progress-step.completed .step-dot {
      background: #48bb78;
    }

    .progress-step.current .step-dot {
      background: linear-gradient(135deg, #667eea, #764ba2);
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
    }

    .step-label {
      font-size: 0.75rem;
      color: #718096;
      text-align: center;
    }

    .progress-step.completed .step-label,
    .progress-step.current .step-label {
      color: #1a1a2e;
      font-weight: 500;
    }

    .delivery-date {
      text-align: center;
      color: #4a5568;
      margin-bottom: 1.5rem;
    }

    .view-details-link {
      display: block;
      text-align: center;
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }

    .view-details-link:hover {
      text-decoration: underline;
    }

    @media (max-width: 600px) {
      .tracking-card {
        padding: 2rem 1.5rem;
      }

      .input-group {
        flex-direction: column;
      }

      .tracking-progress {
        flex-wrap: wrap;
        justify-content: center;
        gap: 1rem;
      }

      .tracking-progress::before {
        display: none;
      }
    }
  `]
})
export class OrderTrackingComponent {
  private orderService = inject(OrderService);

  orderNumber = '';
  trackedOrder = signal<Order | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  trackingSteps = [
    { status: 'pending', label: 'Pending' },
    { status: 'confirmed', label: 'Confirmed' },
    { status: 'processing', label: 'Processing' },
    { status: 'shipped', label: 'Shipped' },
    { status: 'delivered', label: 'Delivered' }
  ];

  private statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'out-for-delivery', 'delivered'];

  trackOrder(): void {
    if (!this.orderNumber.trim()) return;

    this.isLoading.set(true);
    this.error.set(null);
    this.trackedOrder.set(null);

    this.orderService.getOrderByNumber(this.orderNumber.trim()).subscribe({
      next: (order) => {
        this.isLoading.set(false);
        if (order) {
          this.trackedOrder.set(order);
        } else {
          this.error.set('Order not found. Please check the order number and try again.');
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.error.set('Failed to track order. Please try again.');
      }
    });
  }

  formatStatus(status: string): string {
    return status.replace(/-/g, ' ');
  }

  isCompleted(order: Order, status: string): boolean {
    const currentIndex = this.statusOrder.indexOf(order.status);
    const stepIndex = this.statusOrder.indexOf(status);
    return stepIndex < currentIndex;
  }
}

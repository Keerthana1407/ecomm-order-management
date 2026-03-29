import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="orders-page">
      <h1>My Orders</h1>

      @if (orderService.isLoading()) {
        <app-loading-spinner message="Loading orders..." />
      } @else if (orderService.allOrders().length === 0) {
        <div class="no-orders">
          <div class="empty-icon">📦</div>
          <h2>No orders yet</h2>
          <p>Start shopping to see your orders here.</p>
          <a routerLink="/" class="shop-btn">Browse Products</a>
        </div>
      } @else {
        <div class="orders-list">
          @for (order of orderService.allOrders(); track order.id) {
            <div class="order-card">
              <div class="order-header">
                <div class="order-info">
                  <span class="order-number">{{ order.orderNumber }}</span>
                  <span class="order-date">{{ order.createdAt | date:'mediumDate' }}</span>
                </div>
                <span class="order-status" [class]="order.status">
                  {{ formatStatus(order.status) }}
                </span>
              </div>

              <div class="order-items">
                @for (item of order.items.slice(0, 3); track item.productId) {
                  <img [src]="item.productImage" [alt]="item.productName" class="item-thumb" />
                }
                @if (order.items.length > 3) {
                  <span class="more-items">+{{ order.items.length - 3 }} more</span>
                }
              </div>

              <div class="order-footer">
                <div class="order-total">
                  <span class="total-label">Total:</span>
                  <span class="total-amount">{{ order.total | currency }}</span>
                </div>
                <a [routerLink]="['/orders', order.id]" class="view-details-btn">
                  View Details →
                </a>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .orders-page {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
    }

    .orders-page > h1 {
      font-size: 2rem;
      color: #1a1a2e;
      margin-bottom: 2rem;
    }

    .no-orders {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 20px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .no-orders h2 {
      color: #1a1a2e;
      margin-bottom: 0.5rem;
    }

    .no-orders p {
      color: #718096;
      margin-bottom: 2rem;
    }

    .shop-btn {
      display: inline-block;
      padding: 1rem 2rem;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      text-decoration: none;
      border-radius: 10px;
      font-weight: 600;
    }

    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .order-card {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      transition: box-shadow 0.2s;
    }

    .order-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .order-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .order-number {
      font-weight: 600;
      color: #1a1a2e;
      font-size: 1.1rem;
    }

    .order-date {
      font-size: 0.9rem;
      color: #718096;
    }

    .order-status {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: capitalize;
    }

    .order-status.pending {
      background: #fef3c7;
      color: #92400e;
    }

    .order-status.confirmed,
    .order-status.processing {
      background: #dbeafe;
      color: #1e40af;
    }

    .order-status.shipped,
    .order-status.out-for-delivery {
      background: #e0e7ff;
      color: #3730a3;
    }

    .order-status.delivered {
      background: #d1fae5;
      color: #065f46;
    }

    .order-status.cancelled,
    .order-status.returned {
      background: #fee2e2;
      color: #991b1b;
    }

    .order-items {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 0;
      border-top: 1px solid #f7fafc;
      border-bottom: 1px solid #f7fafc;
    }

    .item-thumb {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 8px;
    }

    .more-items {
      font-size: 0.9rem;
      color: #718096;
      font-weight: 500;
    }

    .order-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1rem;
    }

    .order-total {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .total-label {
      color: #718096;
    }

    .total-amount {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1a1a2e;
    }

    .view-details-btn {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.2s;
    }

    .view-details-btn:hover {
      color: #764ba2;
    }

    @media (max-width: 600px) {
      .orders-page {
        padding: 1rem;
      }

      .order-header {
        flex-direction: column;
        gap: 0.75rem;
      }

      .order-items {
        flex-wrap: wrap;
      }

      .item-thumb {
        width: 50px;
        height: 50px;
      }
    }
  `]
})
export class OrderListComponent implements OnInit {
  orderService = inject(OrderService);

  ngOnInit(): void {
    this.orderService.getOrders().subscribe();
  }

  formatStatus(status: string): string {
    return status.replace(/-/g, ' ');
  }
}

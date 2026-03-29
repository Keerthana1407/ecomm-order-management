import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Order, CreateOrderRequest, OrderStatus, OrderStatusHistory } from '../models/order.model';
import { CartService } from './cart.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private api = inject(ApiService);
  private cartService = inject(CartService);

  private orders = signal<Order[]>([]);
  private currentOrder = signal<Order | null>(null);
  private loading = signal(false);

  readonly allOrders = this.orders.asReadonly();
  readonly activeOrder = this.currentOrder.asReadonly();
  readonly isLoading = this.loading.asReadonly();

  // Mock orders for development
  private mockOrders: Order[] = [];
  private orderCounter = 1000;

  createOrder(request: CreateOrderRequest): Observable<Order> {
    this.loading.set(true);
    
    // Replace with: return this.api.post<Order>('orders', request);
    
    const cart = this.cartService.cart();
    const order: Order = {
      id: ++this.orderCounter,
      orderNumber: `ORD-${Date.now()}-${this.orderCounter}`,
      items: cart.items.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.imageUrl,
        price: item.product.price,
        quantity: item.quantity,
        total: item.product.price * item.quantity
      })),
      shippingAddress: request.shippingAddress,
      billingAddress: request.billingAddress,
      paymentMethod: request.paymentMethod,
      status: 'pending',
      subtotal: cart.subtotal,
      tax: cart.tax,
      shipping: cart.shipping,
      total: cart.total,
      createdAt: new Date(),
      updatedAt: new Date(),
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };

    this.mockOrders.unshift(order);

    return of(order).pipe(
      delay(1000),
      tap(o => {
        this.currentOrder.set(o);
        this.cartService.clearCart();
        this.loading.set(false);
      })
    );
  }

  getOrders(): Observable<Order[]> {
    this.loading.set(true);
    
    // Replace with: return this.api.get<Order[]>('orders');
    
    return of(this.mockOrders).pipe(
      delay(500),
      tap(orders => {
        this.orders.set(orders);
        this.loading.set(false);
      })
    );
  }

  getOrderById(id: number): Observable<Order> {
    this.loading.set(true);
    
    // Replace with: return this.api.get<Order>(`orders/${id}`);
    
    const order = this.mockOrders.find(o => o.id === id);
    
    return of(order!).pipe(
      delay(300),
      tap(o => {
        this.currentOrder.set(o);
        this.loading.set(false);
      })
    );
  }

  getOrderByNumber(orderNumber: string): Observable<Order | null> {
    const order = this.mockOrders.find(o => o.orderNumber === orderNumber) || null;
    return of(order).pipe(delay(300));
  }

  getOrderStatusHistory(orderId: number): Observable<OrderStatusHistory[]> {
    const history: OrderStatusHistory[] = [
      { status: 'pending', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), description: 'Order placed' },
      { status: 'confirmed', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), description: 'Order confirmed' },
      { status: 'processing', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), description: 'Preparing your order' },
      { status: 'shipped', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), description: 'Package shipped' }
    ];
    return of(history);
  }

  cancelOrder(orderId: number): Observable<Order> {
    return of(this.mockOrders.find(o => o.id === orderId)!).pipe(
      tap(order => {
        if (order) {
          order.status = 'cancelled';
          order.updatedAt = new Date();
        }
      })
    );
  }
}

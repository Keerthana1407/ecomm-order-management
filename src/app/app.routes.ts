import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/products/product-list/product-list.component')
      .then(m => m.ProductListComponent)
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./features/products/product-detail/product-detail.component')
      .then(m => m.ProductDetailComponent)
  },
  {
    path: 'cart',
    loadComponent: () => import('./features/cart/cart.component')
      .then(m => m.CartComponent)
  },
  {
    path: 'checkout',
    loadComponent: () => import('./features/checkout/checkout.component')
      .then(m => m.CheckoutComponent)
  },
  {
    path: 'orders',
    loadComponent: () => import('./features/orders/order-list/order-list.component')
      .then(m => m.OrderListComponent)
  },
  {
    path: 'orders/:id',
    loadComponent: () => import('./features/orders/order-detail/order-detail.component')
      .then(m => m.OrderDetailComponent)
  },
  {
    path: 'track-order',
    loadComponent: () => import('./features/orders/order-tracking/order-tracking.component')
      .then(m => m.OrderTrackingComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];

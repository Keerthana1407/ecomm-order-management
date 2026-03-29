import { Injectable, PLATFORM_ID, inject, signal, computed, effect } from '@angular/core';
import { Product } from '../models/product.model';
import { Cart, CartItem } from '../models/cart.model';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // 1. Inject Platform ID to detect Browser vs Server
  private platformId = inject(PLATFORM_ID);
  
  private cartItems = signal<CartItem[]>([]);
  private readonly TAX_RATE = 0.08;
  private readonly FREE_SHIPPING_THRESHOLD = 100;
  private readonly SHIPPING_COST = 9.99;

  readonly items = this.cartItems.asReadonly();
  
  readonly totalItems = computed(() => 
    this.cartItems().reduce((sum, item) => sum + item.quantity, 0)
  );

  readonly subtotal = computed(() => 
    this.cartItems().reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  );

  readonly tax = computed(() => this.subtotal() * this.TAX_RATE);

  readonly shipping = computed(() => 
    this.subtotal() >= this.FREE_SHIPPING_THRESHOLD ? 0 : this.SHIPPING_COST
  );

  readonly total = computed(() => this.subtotal() + this.tax() + this.shipping());

  // This fixes the "Property 'cart' does not exist" error in other files
  readonly cart = computed<Cart>(() => ({
    items: this.cartItems(),
    totalItems: this.totalItems(),
    subtotal: this.subtotal(),
    tax: this.tax(),
    shipping: this.shipping(),
    total: this.total()
  }));

  readonly isEmpty = computed(() => this.cartItems().length === 0);

  constructor() {
    // 2. ONLY load from storage if we are in the browser
    if (isPlatformBrowser(this.platformId)) {
      this.loadFromStorage();
    }
    
    // 3. Effect is now safe because we check the platform before accessing localStorage
    effect(() => {
      const currentItems = this.cartItems();
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('cart', JSON.stringify(currentItems));
      }
    });
  }

  private loadFromStorage(): void {
    // Extra safety check
    if (!isPlatformBrowser(this.platformId)) return;

    const stored = localStorage.getItem('cart');
    if (stored) {
      try {
        const items = JSON.parse(stored) as CartItem[];
        this.cartItems.set(items);
      } catch {
        localStorage.removeItem('cart');
      }
    }
  }

  addToCart(product: Product, quantity: number = 1): void {
    this.cartItems.update(items => {
      const existingIndex = items.findIndex(item => item.product.id === product.id);
      
      if (existingIndex > -1) {
        const updated = [...items];
        const newQuantity = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: Math.min(newQuantity, product.stock)
        };
        return updated;
      }
      
      return [...items, { 
        product, 
        quantity: Math.min(quantity, product.stock), 
        addedAt: new Date() 
      }];
    });
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    this.cartItems.update(items => 
      items.map(item => 
        item.product.id === productId
          ? { ...item, quantity: Math.min(quantity, item.product.stock) }
          : item
      )
    );
  }

  removeFromCart(productId: number): void {
    this.cartItems.update(items => 
      items.filter(item => item.product.id !== productId)
    );
  }

  clearCart(): void {
    this.cartItems.set([]);
  }

  isInCart(productId: number): boolean {
    return this.cartItems().some(item => item.product.id === productId);
  }

  getItemQuantity(productId: number): number {
    const item = this.cartItems().find(i => i.product.id === productId);
    return item?.quantity || 0;
  }
}
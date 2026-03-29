import { Component, inject, OnInit, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../core/models/product.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  template: `
    @if (productService.isLoading()) {
      <app-loading-spinner [overlay]="true" message="Loading product..." />
    }

    @if (product(); as p) {
      <div class="product-detail-page">
        <nav class="breadcrumb">
          <a routerLink="/">Products</a>
          <span>/</span>
          <a [routerLink]="['/']" [queryParams]="{category: p.category}">{{ p.category }}</a>
          <span>/</span>
          <span>{{ p.name }}</span>
        </nav>

        <div class="product-detail">
          <div class="product-gallery">
            <div class="main-image">
              @if (p.isOnSale) {
                <span class="sale-badge">Sale</span>
              }
              <img [src]="p.imageUrl" [alt]="p.name" />
            </div>
          </div>

          <div class="product-info">
            <span class="category">{{ p.category }}</span>
            <h1 class="title">{{ p.name }}</h1>

            <div class="rating">
              <span class="stars">{{ getStars(p.rating) }}</span>
              <span class="rating-value">{{ p.rating }}</span>
              <span class="review-count">({{ p.reviewCount }} reviews)</span>
            </div>

            <div class="price-section">
              <span class="current-price">{{ p.price | currency }}</span>
              @if (p.originalPrice) {
                <span class="original-price">{{ p.originalPrice | currency }}</span>
                <span class="discount">
                  {{ getDiscountPercent(p.originalPrice, p.price) }}% OFF
                </span>
              }
            </div>

            <p class="description">{{ p.description }}</p>

            <div class="stock-info" [class.low-stock]="p.stock < 10" [class.out-of-stock]="p.stock === 0">
              @if (p.stock === 0) {
                <span>❌ Out of Stock</span>
              } @else if (p.stock < 10) {
                <span>⚠️ Only {{ p.stock }} left in stock!</span>
              } @else {
                <span>✓ In Stock ({{ p.stock }} available)</span>
              }
            </div>

            <div class="quantity-section">
              <label>Quantity:</label>
              <div class="quantity-controls">
                <button (click)="decrementQuantity()" [disabled]="quantity() <= 1">−</button>
                <span class="quantity-value">{{ quantity() }}</span>
                <button (click)="incrementQuantity()" [disabled]="quantity() >= p.stock">+</button>
              </div>
            </div>

            <div class="action-buttons">
              <button
                class="add-to-cart-btn"
                [disabled]="p.stock === 0"
                (click)="addToCart()"
              >
                @if (cartService.isInCart(p.id)) {
                  Update Cart
                } @else {
                  Add to Cart
                }
              </button>
              <button class="buy-now-btn" [disabled]="p.stock === 0" routerLink="/checkout">
                Buy Now
              </button>
            </div>

            @if (p.tags?.length) {
              <div class="tags">
                @for (tag of p.tags; track tag) {
                  <span class="tag">{{ tag }}</span>
                }
              </div>
            }
          </div>
        </div>

        <!-- Recommendations -->
        @if (recommendations().length > 0) {
          <section class="recommendations">
            <h2>You May Also Like</h2>
            <div class="recommendations-grid">
              @for (rec of recommendations(); track rec.id) {
                <a [routerLink]="['/products', rec.id]" class="recommendation-card">
                  <img [src]="rec.imageUrl" [alt]="rec.name" />
                  <div class="rec-info">
                    <h4>{{ rec.name }}</h4>
                    <span class="rec-price">{{ rec.price | currency }}</span>
                  </div>
                </a>
              }
            </div>
          </section>
        }
      </div>
    }
  `,
  styles: [`
    .product-detail-page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 2rem;
      font-size: 0.9rem;
      color: #718096;
    }

    .breadcrumb a {
      color: #667eea;
      text-decoration: none;
    }

    .breadcrumb a:hover {
      text-decoration: underline;
    }

    .product-detail {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      background: white;
      border-radius: 20px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }

    .main-image {
      position: relative;
      border-radius: 16px;
      overflow: hidden;
    }

    .main-image img {
      width: 100%;
      height: 500px;
      object-fit: cover;
    }

    .sale-badge {
      position: absolute;
      top: 16px;
      left: 16px;
      background: #e53e3e;
      color: white;
      padding: 6px 16px;
      border-radius: 20px;
      font-weight: 600;
    }

    .product-info {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .category {
      font-size: 0.85rem;
      color: #667eea;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .title {
      font-size: 2rem;
      color: #1a1a2e;
      line-height: 1.2;
    }

    .rating {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .stars {
      color: #f6ad55;
      font-size: 1.1rem;
    }

    .rating-value {
      font-weight: 600;
      color: #1a1a2e;
    }

    .review-count {
      color: #718096;
    }

    .price-section {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin: 0.5rem 0;
    }

    .current-price {
      font-size: 2rem;
      font-weight: 700;
      color: #1a1a2e;
    }

    .original-price {
      font-size: 1.25rem;
      color: #a0aec0;
      text-decoration: line-through;
    }

    .discount {
      background: #fed7d7;
      color: #c53030;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .description {
      color: #4a5568;
      line-height: 1.7;
    }

    .stock-info {
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-weight: 500;
      background: #c6f6d5;
      color: #276749;
    }

    .stock-info.low-stock {
      background: #fefcbf;
      color: #975a16;
    }

    .stock-info.out-of-stock {
      background: #fed7d7;
      color: #c53030;
    }

    .quantity-section {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .quantity-section label {
      font-weight: 500;
      color: #4a5568;
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }

    .quantity-controls button {
      width: 44px;
      height: 44px;
      border: none;
      background: #f7fafc;
      font-size: 1.25rem;
      cursor: pointer;
      transition: background 0.2s;
    }

    .quantity-controls button:hover:not(:disabled) {
      background: #e2e8f0;
    }

    .quantity-controls button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .quantity-value {
      width: 60px;
      text-align: center;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }

    .add-to-cart-btn,
    .buy-now-btn {
      flex: 1;
      padding: 1rem 2rem;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .add-to-cart-btn {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }

    .add-to-cart-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }

    .buy-now-btn {
      background: #1a1a2e;
      color: white;
    }

    .buy-now-btn:hover:not(:disabled) {
      background: #2d3748;
    }

    .action-buttons button:disabled {
      background: #e2e8f0;
      color: #a0aec0;
      cursor: not-allowed;
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .tag {
      background: #edf2f7;
      color: #4a5568;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.85rem;
    }

    /* Recommendations */
    .recommendations {
      margin-top: 3rem;
    }

    .recommendations h2 {
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
      color: #1a1a2e;
    }

    .recommendations-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }

    .recommendation-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      text-decoration: none;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .recommendation-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }

    .recommendation-card img {
      width: 100%;
      height: 160px;
      object-fit: cover;
    }

    .rec-info {
      padding: 1rem;
    }

    .rec-info h4 {
      font-size: 0.95rem;
      color: #1a1a2e;
      margin-bottom: 0.5rem;
      line-height: 1.3;
    }

    .rec-price {
      font-weight: 600;
      color: #667eea;
    }

    @media (max-width: 968px) {
      .product-detail {
        grid-template-columns: 1fr;
      }

      .main-image img {
        height: 400px;
      }

      .recommendations-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 600px) {
      .product-detail-page {
        padding: 1rem;
      }

      .product-detail {
        padding: 1rem;
      }

      .title {
        font-size: 1.5rem;
      }

      .current-price {
        font-size: 1.5rem;
      }

      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  @Input() id!: string;

  productService = inject(ProductService);
  cartService = inject(CartService);

  product = this.productService.currentProduct;
  recommendations = signal<Product[]>([]);
  quantity = signal(1);

  ngOnInit(): void {
    const productId = parseInt(this.id, 10);
    this.productService.getProductById(productId).subscribe();
    this.productService.getRecommendations(productId).subscribe(recs => 
      this.recommendations.set(recs)
    );
  }

  incrementQuantity(): void {
    const p = this.product();
    if (p && this.quantity() < p.stock) {
      this.quantity.update(q => q + 1);
    }
  }

  decrementQuantity(): void {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }

  addToCart(): void {
    const p = this.product();
    if (p) {
      this.cartService.addToCart(p, this.quantity());
    }
  }

  getStars(rating: number): string {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
  }

  getDiscountPercent(original: number, current: number): number {
    return Math.round(((original - current) / original) * 100);
  }
}

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { Product, ProductFilter } from '../../../core/models/product.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="products-page">
      <!-- Filters Sidebar -->
      <aside class="filters-sidebar">
        <div class="filter-section">
          <h3>Search</h3>
          <input
            type="text"
            placeholder="Search products..."
            [(ngModel)]="searchTerm"
            (input)="applyFilters()"
            class="search-input"
          />
        </div>

        <div class="filter-section">
          <h3>Categories</h3>
          <div class="category-list">
            <button
              class="category-btn"
              [class.active]="!selectedCategory()"
              (click)="selectCategory(null)"
            >
              All Products
            </button>
            @for (category of categories(); track category) {
              <button
                class="category-btn"
                [class.active]="selectedCategory() === category"
                (click)="selectCategory(category)"
              >
                {{ category }}
              </button>
            }
          </div>
        </div>

        <div class="filter-section">
          <h3>Price Range</h3>
          <div class="price-inputs">
            <input
              type="number"
              placeholder="Min"
              [(ngModel)]="minPrice"
              (change)="applyFilters()"
              class="price-input"
            />
            <span>—</span>
            <input
              type="number"
              placeholder="Max"
              [(ngModel)]="maxPrice"
              (change)="applyFilters()"
              class="price-input"
            />
          </div>
        </div>

        <div class="filter-section">
          <h3>Sort By</h3>
          <select [(ngModel)]="sortBy" (change)="applyFilters()" class="sort-select">
            <option value="">Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </aside>

      <!-- Products Grid -->
      <main class="products-main">
        <div class="products-header">
          <h1>{{ selectedCategory() || 'All Products' }}</h1>
          <p class="results-count">{{ productService.products().length }} products found</p>
        </div>

        @if (productService.isLoading()) {
          <app-loading-spinner message="Loading products..." />
        } @else {
          <div class="products-grid">
            @for (product of productService.products(); track product.id) {
              <article class="product-card">
                @if (product.isOnSale) {
                  <span class="sale-badge">Sale</span>
                }
                
                <a [routerLink]="['/products', product.id]" class="product-image-link">
                  <img [src]="product.imageUrl" [alt]="product.name" class="product-image" />
                </a>

                <div class="product-info">
                  <span class="product-category">{{ product.category }}</span>
                  
                  <a [routerLink]="['/products', product.id]" class="product-name">
                    {{ product.name }}
                  </a>

                  <div class="product-rating">
                    <span class="stars">{{ getStars(product.rating) }}</span>
                    <span class="review-count">({{ product.reviewCount }})</span>
                  </div>

                  <div class="product-price">
                    <span class="current-price">{{ product.price | currency }}</span>
                    @if (product.originalPrice) {
                      <span class="original-price">{{ product.originalPrice | currency }}</span>
                    }
                  </div>

                  <button
                    class="add-to-cart-btn"
                    [class.in-cart]="cartService.isInCart(product.id)"
                    [disabled]="product.stock === 0"
                    (click)="addToCart(product)"
                  >
                    @if (product.stock === 0) {
                      Out of Stock
                    } @else if (cartService.isInCart(product.id)) {
                      ✓ In Cart ({{ cartService.getItemQuantity(product.id) }})
                    } @else {
                      Add to Cart
                    }
                  </button>
                </div>
              </article>
            } @empty {
              <div class="no-products">
                <p>No products found matching your criteria.</p>
                <button class="reset-filters-btn" (click)="resetFilters()">
                  Reset Filters
                </button>
              </div>
            }
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .products-page {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 2rem;
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    /* Filters Sidebar */
    .filters-sidebar {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      height: fit-content;
      position: sticky;
      top: 100px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }

    .filter-section {
      margin-bottom: 1.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .filter-section:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }

    .filter-section h3 {
      font-size: 0.875rem;
      font-weight: 600;
      color: #4a5568;
      margin-bottom: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .search-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.95rem;
      transition: border-color 0.2s;
    }

    .search-input:focus {
      outline: none;
      border-color: #667eea;
    }

    .category-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .category-btn {
      background: none;
      border: none;
      padding: 0.5rem 0.75rem;
      text-align: left;
      border-radius: 6px;
      cursor: pointer;
      color: #4a5568;
      transition: all 0.2s;
    }

    .category-btn:hover {
      background: #f7fafc;
      color: #667eea;
    }

    .category-btn.active {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }

    .price-inputs {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .price-input {
      flex: 1;
      padding: 0.5rem 0.75rem;
      border: 2px solid #e2e8f0;
      border-radius: 6px;
      font-size: 0.9rem;
    }

    .price-input:focus {
      outline: none;
      border-color: #667eea;
    }

    .sort-select {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.95rem;
      cursor: pointer;
      background: white;
    }

    /* Products Main */
    .products-main {
      min-height: 60vh;
    }

    .products-header {
      margin-bottom: 1.5rem;
    }

    .products-header h1 {
      font-size: 1.75rem;
      color: #1a1a2e;
      margin-bottom: 0.25rem;
    }

    .results-count {
      color: #718096;
      font-size: 0.95rem;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    /* Product Card */
    .product-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      transition: transform 0.2s, box-shadow 0.2s;
      position: relative;
    }

    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
    }

    .sale-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      background: #e53e3e;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      z-index: 1;
    }

    .product-image-link {
      display: block;
      overflow: hidden;
    }

    .product-image {
      width: 100%;
      height: 220px;
      object-fit: cover;
      transition: transform 0.3s;
    }

    .product-card:hover .product-image {
      transform: scale(1.05);
    }

    .product-info {
      padding: 1.25rem;
    }

    .product-category {
      font-size: 0.75rem;
      color: #667eea;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .product-name {
      display: block;
      font-size: 1.1rem;
      font-weight: 600;
      color: #1a1a2e;
      text-decoration: none;
      margin: 0.5rem 0;
      line-height: 1.4;
    }

    .product-name:hover {
      color: #667eea;
    }

    .product-rating {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .stars {
      color: #f6ad55;
      font-size: 0.9rem;
    }

    .review-count {
      color: #a0aec0;
      font-size: 0.8rem;
    }

    .product-price {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .current-price {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1a1a2e;
    }

    .original-price {
      font-size: 0.95rem;
      color: #a0aec0;
      text-decoration: line-through;
    }

    .add-to-cart-btn {
      width: 100%;
      padding: 0.875rem;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .add-to-cart-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .add-to-cart-btn:disabled {
      background: #e2e8f0;
      color: #a0aec0;
      cursor: not-allowed;
    }

    .add-to-cart-btn.in-cart {
      background: #48bb78;
    }

    .no-products {
      grid-column: 1 / -1;
      text-align: center;
      padding: 3rem;
      color: #718096;
    }

    .reset-filters-btn {
      margin-top: 1rem;
      padding: 0.75rem 1.5rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
    }

    @media (max-width: 968px) {
      .products-page {
        grid-template-columns: 1fr;
        padding: 1rem;
      }

      .filters-sidebar {
        position: static;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }

      .filter-section {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
      }
    }

    @media (max-width: 600px) {
      .filters-sidebar {
        grid-template-columns: 1fr;
      }

      .products-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }

      .product-image {
        height: 160px;
      }

      .product-info {
        padding: 1rem;
      }
    }
  `]
})
export class ProductListComponent implements OnInit {
  productService = inject(ProductService);
  cartService = inject(CartService);

  categories = signal<string[]>([]);
  selectedCategory = signal<string | null>(null);

  searchTerm = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  sortBy = '';

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    const filter: ProductFilter = {};
    
    if (this.selectedCategory()) filter.category = this.selectedCategory()!;
    if (this.searchTerm) filter.searchTerm = this.searchTerm;
    if (this.minPrice) filter.minPrice = this.minPrice;
    if (this.maxPrice) filter.maxPrice = this.maxPrice;
    if (this.sortBy) filter.sortBy = this.sortBy as ProductFilter['sortBy'];

    this.productService.getProducts(filter).subscribe();
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe(cats => this.categories.set(cats));
  }

  selectCategory(category: string | null): void {
    this.selectedCategory.set(category);
    this.applyFilters();
  }

  applyFilters(): void {
    this.loadProducts();
  }

  resetFilters(): void {
    this.selectedCategory.set(null);
    this.searchTerm = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.sortBy = '';
    this.loadProducts();
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
  }

  getStars(rating: number): string {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    return '★'.repeat(fullStars) + (hasHalf ? '½' : '') + '☆'.repeat(5 - fullStars - (hasHalf ? 1 : 0));
  }
}

import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Product, ProductFilter, PaginatedResponse } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private api = inject(ApiService);
  
  private productsCache = signal<Product[]>([]);
  private selectedProduct = signal<Product | null>(null);
  private loading = signal(false);

  readonly products = this.productsCache.asReadonly();
  readonly currentProduct = this.selectedProduct.asReadonly();
  readonly isLoading = this.loading.asReadonly();

  // Mock data for development (remove when backend is ready)
  private mockProducts: Product[] = [
    {
      id: 1,
      name: 'Wireless Bluetooth Headphones',
      description: 'Premium noise-canceling headphones with 30-hour battery life',
      price: 199.99,
      originalPrice: 249.99,
      imageUrl: '[images.unsplash.com](https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400)',
      category: 'Electronics',
      stock: 50,
      rating: 4.5,
      reviewCount: 128,
      isOnSale: true,
      tags: ['wireless', 'bluetooth', 'noise-canceling']
    },
    {
      id: 2,
      name: 'Smart Watch Pro',
      description: 'Advanced fitness tracking with heart rate monitor',
      price: 299.99,
      imageUrl: '[images.unsplash.com](https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400)',
      category: 'Electronics',
      stock: 35,
      rating: 4.8,
      reviewCount: 256,
      tags: ['smartwatch', 'fitness', 'health']
    },
    {
      id: 3,
      name: 'Leather Messenger Bag',
      description: 'Handcrafted genuine leather bag for professionals',
      price: 149.99,
      imageUrl: '[images.unsplash.com](https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400)',
      category: 'Accessories',
      stock: 20,
      rating: 4.3,
      reviewCount: 89,
      tags: ['leather', 'bag', 'professional']
    },
    {
      id: 4,
      name: 'Organic Coffee Beans',
      description: 'Single-origin Arabica beans from Colombia',
      price: 24.99,
      imageUrl: '[images.unsplash.com](https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400)',
      category: 'Food & Beverage',
      stock: 100,
      rating: 4.7,
      reviewCount: 312,
      tags: ['organic', 'coffee', 'arabica']
    },
    {
      id: 5,
      name: 'Minimalist Desk Lamp',
      description: 'Adjustable LED lamp with touch controls',
      price: 79.99,
      originalPrice: 99.99,
      imageUrl: '[images.unsplash.com](https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400)',
      category: 'Home & Office',
      stock: 45,
      rating: 4.4,
      reviewCount: 67,
      isOnSale: true,
      tags: ['lamp', 'led', 'minimalist']
    },
    {
      id: 6,
      name: 'Running Shoes Ultra',
      description: 'Lightweight performance shoes with responsive cushioning',
      price: 129.99,
      imageUrl: '[images.unsplash.com](https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400)',
      category: 'Sports',
      stock: 60,
      rating: 4.6,
      reviewCount: 198,
      tags: ['running', 'shoes', 'sports']
    },
    {
      id: 7,
      name: 'Mechanical Keyboard',
      description: 'RGB backlit keyboard with Cherry MX switches',
      price: 159.99,
      imageUrl: '[images.unsplash.com](https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400)',
      category: 'Electronics',
      stock: 30,
      rating: 4.9,
      reviewCount: 445,
      tags: ['keyboard', 'mechanical', 'gaming']
    },
    {
      id: 8,
      name: 'Yoga Mat Premium',
      description: 'Extra thick eco-friendly yoga mat with alignment lines',
      price: 49.99,
      imageUrl: '[images.unsplash.com](https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400)',
      category: 'Sports',
      stock: 80,
      rating: 4.2,
      reviewCount: 156,
      tags: ['yoga', 'fitness', 'eco-friendly']
    }
  ];

  getProducts(filter?: ProductFilter): Observable<PaginatedResponse<Product>> {
    this.loading.set(true);
    
    // Use mock data for development
    // Replace with: return this.api.get<PaginatedResponse<Product>>('products', filter);
    
    let filtered = [...this.mockProducts];
    
    if (filter?.category) {
      filtered = filtered.filter(p => p.category === filter.category);
    }
    if (filter?.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.description.toLowerCase().includes(term)
      );
    }
    if (filter?.minPrice) {
      filtered = filtered.filter(p => p.price >= filter.minPrice!);
    }
    if (filter?.maxPrice) {
      filtered = filtered.filter(p => p.price <= filter.maxPrice!);
    }
    if (filter?.sortBy) {
      switch (filter.sortBy) {
        case 'price-asc':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'name':
          filtered.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'rating':
          filtered.sort((a, b) => b.rating - a.rating);
          break;
      }
    }

    const page = filter?.page || 1;
    const pageSize = filter?.pageSize || 12;
    const start = (page - 1) * pageSize;
    const paged = filtered.slice(start, start + pageSize);

    return of({
      items: paged,
      totalCount: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize)
    }).pipe(
      tap(response => {
        this.productsCache.set(response.items);
        this.loading.set(false);
      })
    );
  }

  getProductById(id: number): Observable<Product> {
    this.loading.set(true);
    
    // Replace with: return this.api.get<Product>(`products/${id}`);
    const product = this.mockProducts.find(p => p.id === id);
    
    return of(product!).pipe(
      tap(p => {
        this.selectedProduct.set(p);
        this.loading.set(false);
      })
    );
  }

  getCategories(): Observable<string[]> {
    const categories = [...new Set(this.mockProducts.map(p => p.category))];
    return of(categories);
  }

  getRecommendations(productId: number): Observable<Product[]> {
    // AI-powered recommendations would come from backend
    const currentProduct = this.mockProducts.find(p => p.id === productId);
    const recommendations = this.mockProducts
      .filter(p => p.id !== productId && p.category === currentProduct?.category)
      .slice(0, 4);
    return of(recommendations);
  }
}

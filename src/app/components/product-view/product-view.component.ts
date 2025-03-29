import { Component, OnInit } from '@angular/core';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { ConditionService } from '../../services/condition.service';
import { Condition } from '../../models/condition.model';

@Component({
  selector: 'app-product-view',
  imports: [],
  templateUrl: './product-view.component.html',
  styleUrl: './product-view.component.css'
})
export class ProductViewComponent implements OnInit {

  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  conditions: Condition[] = [];

  searchTerm: string = '';
  selectedCategory: string = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;

  constructor(private productService: ProductService, private categoryService: CategoryService, private conditionService: ConditionService) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadConditions();
    this.loadCategories();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data: Product[]) => {
        this.products = data;
        this.filteredProducts = data;
      },
      error: (err: any) => console.error('❌ שגיאה בטעינת מוצרים:', err)
    });
  }

  filterProducts(): void {
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = this.searchTerm ? product.name.includes(this.searchTerm) : true;
      const matchesCategory = this.selectedCategory ? product.category.id === +this.selectedCategory : true;
      const matchesMinPrice = this.minPrice !== null ? product.price >= this.minPrice : true;
      const matchesMaxPrice = this.maxPrice !== null ? product.price <= this.maxPrice : true;
      return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice;
    });
  }

  viewProduct(product: Product): void {
    console.log('📌 צפייה במוצר:', product);
  }

    loadConditions(): void {
      this.conditionService.getConditions().subscribe({
        next: (data: Condition[]) => {
          console.log('📌 תנאים נטענו:', data);
          this.conditions = data;
        },
        error: (err: any) => {
          console.error('❌ שגיאה בטעינת תנאים:', err);
        }
      });
    }
  
    loadCategories(): void {
      this.categoryService.getCategories().subscribe({
        next: (data) => {
          console.log('📌 קטגוריות נטענו:', data);
          this.categories = data;
        },
        error: (err) => {
          console.error('❌ שגיאה בטעינת קטגוריות:', err);
        }
      });
    }
}



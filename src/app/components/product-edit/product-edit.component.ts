import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';

import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ✅ הייבוא הנכון ל-FormsModule
import { Condition } from '../../models/condition.model';
import { CategoryService } from '../../services/category.service';
import { ConditionService } from '../../services/condition.service';
import { PriceEstimateService, PriceRange } from '../../services/price-estimate.service';
import { DialogModule } from 'primeng/dialog';
import { AuthService } from '../../auth.service';
import { ProductService } from '../../services/product.service';
import { Router } from '@angular/router';






@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [ButtonModule, InputTextModule,DialogModule, NgIf, NgFor, FormsModule],
  templateUrl: './product-edit.component.html',
  styleUrl: './product-edit.component.css'
})
export class ProductEditComponent {

  currentProduct: Product = new Product();
  categories: Category[] = [];
  conditions: Condition[] = [];

   // משתנים לשיערוך מחיר
  estimateResult?: PriceRange;
  loadingEstimate = false;
  estimateError?: string;
  showEstimateDialog = false;

  isPricePositive:Boolean = true ;
  productAdded:Boolean = false;



  constructor(private categoryService: CategoryService, private conditionService: ConditionService, private priceEstimateSvc: PriceEstimateService, private authService: AuthService, 
    private productService: ProductService,   private router: Router
  ) {}

  ngOnInit(): void {
    this.currentProduct = new Product();
    this.loadCategories();
    this.loadConditions();
  }

  isEstimateButtonDisabled(): boolean {
    const p = this.currentProduct;
    const hasRequiredFields =
      !!p.name &&
      !!p.category &&
      !!p.condition &&
      !!p.manufacturer &&
      p.yearsUsed != null &&
      p.yearsUsed >= 0 &&
      p.purchasePrice > 0;
  
    return !hasRequiredFields || this.loadingEstimate || !this.isPricePositive;
  }


  estimateProductPrice(): void {
    this.estimateError = undefined;
    this.estimateResult = undefined;
    this.loadingEstimate = true;
  
    // 1. בונים מערך של חלקי המידע
    const p = this.currentProduct;
    const parts: string[] = [
      `Name: ${p.name}`,
      `Category: ${p.category?.name}`,
      `Condition: ${p.condition?.name}`,
      `Manufacturer: ${p.manufacturer}`,
      `Years Used: ${p.yearsUsed}`,
      `Purchase Price: ₪${p.purchasePrice}`
    ];
  
    // 2. מוסיפים פרטים רק אם הם קיימים
    if (p.description) { parts.push(`Description: ${p.description}`); }
    if (p.material)    { parts.push(`Material: ${p.material}`); }
    if (p.dimensions)  { parts.push(`Dimensions: ${p.dimensions}`); }
  
    // 3. מאחדים למחרוזת אחת
    const payload = parts.join('; ');
    console.log(payload);
  
    // 4. שולחים את המחרוזת במקום description
    this.priceEstimateSvc
      .estimate(payload)
      .subscribe({
        next: (res) => {
          this.estimateResult = res;
          this.loadingEstimate = false;
          console.log("estimate obj ",this.estimateResult);
          console.log("res " ,res);
          this.showEstimateDialog = true;

          
        },
        error: (err) => {
          this.estimateError = err.error?.message || 'שגיאה בשרת';
          this.loadingEstimate = false;
        }
      });
  }
  
  insertNewProducts(): void {
    console.log('Final price chosen:', this.currentProduct.price);
    const uid = this.authService.getCurrentUserId();
    this.currentProduct.userId = uid ? uid : '';
    this.showEstimateDialog = false;

    this.productService.insertNewProducts(this.currentProduct).subscribe({
      next: saved => {
        console.log('✅ Product saved:', saved);
        this.productAdded = true; 
      },
      error: err => {
        console.error('❌ Error saving product:', err);
      }
    });

    
  }

  cleanProductFields(){
    this.currentProduct = new Product();
    this.estimateResult = undefined;
    this.estimateError = undefined;
  }

  onPriceChange(newPrice: number): void {
    console.log('מחיר חדש:', newPrice);
    if(newPrice <= 0)
    {
      this.isPricePositive = false;
    }
    else
    {
      this.isPricePositive = true;
    }
    console.log(this.isPricePositive);
    
  }

  checkIfPriceInRange()
  {
    const price = this.currentProduct.price ?? 0;

    if (!this.estimateResult) {
      this.currentProduct.approvedByAI = false;
      return;
    }
  
    const { minPrice, maxPrice } = this.estimateResult;
  
    this.currentProduct.approvedByAI =
      price >= minPrice && price <= maxPrice;
    
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

  goToProductView() {
    this.router.navigate(['/product-view']);
  }
  
  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });

  }
  print() {
    console.log("product: " ,this.currentProduct);
    console.log("categories: " ,this.categories);
  }

}

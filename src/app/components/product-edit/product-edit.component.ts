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




@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [ButtonModule, InputTextModule, NgIf, NgFor, FormsModule],
  templateUrl: './product-edit.component.html',
  styleUrl: './product-edit.component.css'
})
export class ProductEditComponent {

  currentProduct: Product = new Product();
  categories: Category[] = [];
  conditions: Condition[] = [];

  constructor(private categoryService: CategoryService, private conditionService: ConditionService) {}

  ngOnInit(): void {
    this.currentProduct = new Product();
    this.loadCategories();
    this.loadConditions();
  }

  cleanProductFields(){

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

  print() {
    console.log("product: " ,this.currentProduct);
    console.log("categories: " ,this.categories);
  }


}

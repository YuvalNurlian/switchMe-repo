import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product } from '../models/product.model';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root' // גורם ל-Angular להכניס את ה-Service לכל הפרויקט
})
export class ProductService {

  private products: Product[] = [];



  constructor() {}

  // מחזיר רשימה של מוצרים (מדמה קריאה ל-API)
  getProducts(): Observable<Product[]> {
    return of(this.products);
  }


}

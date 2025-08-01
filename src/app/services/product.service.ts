import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product } from '../models/product.model';
import { Category } from '../models/category.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root' // גורם ל-Angular להכניס את ה-Service לכל הפרויקט
})
export class ProductService {

  private products: Product[] = [];
  private apiUrl = 'http://localhost:3000/products'; // עדכן בהתאם לנתיב שלך ב-Backend



  constructor(private http: HttpClient) {}

  getProductsByUserId(uid :string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/user/${uid}`);

  }

  getProductsNotMine(uid: string): Observable<Product[]> {
    return this.http.get<Product[]>(`http://localhost:3000/products/not-mine/${uid}`);
  }

  getProductsByInterest(userId: string, isInterest: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/interest/${userId}/${isInterest}`);
  }
  
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  
  insertNewProducts(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  markAsInterested(userId: string, productId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/mark-as-interested`, { userId, productId });
  }
  markAsNotInterested(userId: string, productId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/mark-as-not-interested`, { userId, productId });
  }

  getProductsInterestedByOthers(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/interested-by-others/${userId}`);
  }

  getPotentialExchangeProducts(productId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/potential-exchange/${productId}`);
  }
  getMutualExchangeMatches(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/mutual-exchange/${userId}`);
  }

  performExchange(myProductUserId: string, matchedProductUserId: string, myProductName: string, matchedProductName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/perform-exchange`, { myProductUserId, matchedProductUserId, myProductName, matchedProductName });
  }

}

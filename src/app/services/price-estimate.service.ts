import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface PriceRange {
  minPrice: number;
  maxPrice: number;
}

@Injectable({ providedIn: 'root' })
export class PriceEstimateService {
  // מתאים ל־endpoint שהגדרת ב-NestJS
  private readonly apiUrl = 'http://localhost:3000/products/estimate';

  constructor(private http: HttpClient) {}

  estimate(description: string): Observable<PriceRange> {
    console.log(description);
    
    return this.http.post<PriceRange>(
      this.apiUrl,
      { description }
    );

    // const stub: PriceRange = { minPrice: 150, maxPrice: 300 };
    // return of(stub);
  }
}

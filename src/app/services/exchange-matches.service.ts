import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExchangeMatch } from '../models/exchange-match.model';

@Injectable({
  providedIn: 'root'
})
export class ExchangeMatchesService {

  private apiUrl = 'http://localhost:3000/api/exchange-matches';

  constructor(private http: HttpClient) { }

  getExchangeMatches(userId: string): Observable<ExchangeMatch[]> {
    return this.http.get<ExchangeMatch[]>(`${this.apiUrl}/${userId}`);
  }

  generateExchangeMatches(): Observable<any> {
    return this.http.post(`${this.apiUrl}/generate`, {});
  }
}

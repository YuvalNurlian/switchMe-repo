import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Condition } from '../models/condition.model';

@Injectable({
  providedIn: 'root',
})
export class ConditionService {
  private apiUrl = 'http://localhost:3000/conditions'; // נתיב ל-Backend

  constructor(private http: HttpClient) {}

  getConditions(): Observable<Condition[]> {
    return this.http.get<Condition[]>(this.apiUrl);
  }
}

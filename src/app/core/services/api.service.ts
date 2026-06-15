import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/category.model';
import { Customer } from '../models/customer.model';
import { Item } from '../models/item.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api';

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories`);
  }

  createCategory(name: string): Observable<Category> {
    return this.http.post<Category>(`${this.baseUrl}/categories`, { name });
  }

  getItems(inStock?: boolean): Observable<Item[]> {
    let params = new HttpParams();
    if (inStock !== undefined) {
      params = params.set('inStock', String(inStock));
    }
    return this.http.get<Item[]>(`${this.baseUrl}/items`, { params });
  }

  createItem(payload: { name: string; price: number; inStock: boolean; categoryId: number }): Observable<Item> {
    return this.http.post<Item>(`${this.baseUrl}/items`, payload);
  }

  updateItem(id: number, payload: { name: string; price: number; inStock: boolean; categoryId: number }): Observable<Item> {
    return this.http.put<Item>(`${this.baseUrl}/items/${id}`, payload);
  }

  getDailySalesReport(): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.baseUrl}/reports/daily-sales`, {
      observe: 'response',
      responseType: 'blob' as const
    });
  }

  getCustomers(status?: 'ACTIVE' | 'INACTIVE', search?: string): Observable<Customer[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    if (search?.trim()) {
      params = params.set('search', search.trim());
    }
    return this.http.get<Customer[]>(`${this.baseUrl}/customers`, { params });
  }

  createCustomer(payload: { name: string; orderLines: Array<{ itemId: number; quantity: number }> }): Observable<Customer> {
    return this.http.post<Customer>(`${this.baseUrl}/customers`, payload);
  }

  updateCustomerName(id: number, name: string): Observable<Customer> {
    return this.http.put<Customer>(`${this.baseUrl}/customers/${id}`, { name });
  }

  addOrderLine(customerId: number, payload: { itemId: number; quantity: number }): Observable<Customer> {
    return this.http.post<Customer>(`${this.baseUrl}/customers/${customerId}/order-lines`, payload);
  }

  removeOrderLine(customerId: number, lineId: number): Observable<Customer> {
    return this.http.delete<Customer>(`${this.baseUrl}/customers/${customerId}/order-lines/${lineId}`);
  }

  updateCustomerStatus(id: number, status: 'ACTIVE' | 'INACTIVE'): Observable<Customer> {
    return this.http.put<Customer>(`${this.baseUrl}/customers/${id}/status`, { status });
  }
}

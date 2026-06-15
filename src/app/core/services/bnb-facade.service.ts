import { Injectable, signal } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';
import { ApiService } from './api.service';
import { Category } from '../models/category.model';
import { Customer } from '../models/customer.model';
import { Item } from '../models/item.model';

@Injectable({ providedIn: 'root' })
export class BnbFacadeService {
  readonly activeCustomers = signal<Customer[]>([]);
  readonly inactiveCustomers = signal<Customer[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly catalogItems = signal<Item[]>([]);
  readonly availableItems = signal<Item[]>([]);
  readonly dashboardLoading = signal(false);
  readonly catalogLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly search = signal('');

  constructor(private readonly api: ApiService) {}

  loadDashboard(search = this.search()): void {
    this.search.set(search);
    this.dashboardLoading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      active: this.api.getCustomers('ACTIVE', search),
      inactive: this.api.getCustomers('INACTIVE', search),
      availableItems: this.api.getItems(true)
    }).subscribe({
      next: ({ active, inactive, availableItems }) => {
        this.activeCustomers.set(active);
        this.inactiveCustomers.set(inactive);
        this.availableItems.set(availableItems);
        this.dashboardLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(this.readError(error));
        this.dashboardLoading.set(false);
      }
    });
  }

  loadCatalog(): void {
    this.catalogLoading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      categories: this.api.getCategories(),
      items: this.api.getItems()
    }).subscribe({
      next: ({ categories, items }) => {
        this.categories.set(categories);
        this.catalogItems.set(items);
        this.availableItems.set(items.filter((item) => item.inStock));
        this.catalogLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(this.readError(error));
        this.catalogLoading.set(false);
      }
    });
  }

  createCustomer(payload: { name: string; orderLines: Array<{ itemId: number; quantity: number }> }): Observable<Customer> {
    return this.api.createCustomer(payload).pipe(
      tap(() => this.loadDashboard())
    );
  }

  updateCustomerName(id: number, name: string): Observable<Customer> {
    return this.api.updateCustomerName(id, name).pipe(
      tap((customer) => this.patchCustomer(customer))
    );
  }

  addOrderLine(customerId: number, payload: { itemId: number; quantity: number }): Observable<Customer> {
    return this.api.addOrderLine(customerId, payload).pipe(
      tap((customer) => this.patchCustomer(customer))
    );
  }

  removeOrderLine(customerId: number, lineId: number): Observable<Customer> {
    return this.api.removeOrderLine(customerId, lineId).pipe(
      tap((customer) => this.patchCustomer(customer))
    );
  }

  changeCustomerStatus(id: number, status: 'ACTIVE' | 'INACTIVE'): Observable<Customer> {
    return this.api.updateCustomerStatus(id, status).pipe(
      tap(() => this.loadDashboard())
    );
  }

  createCategory(name: string): Observable<Category> {
    return this.api.createCategory(name).pipe(
      tap(() => this.loadCatalog())
    );
  }

  createItem(payload: { name: string; price: number; inStock: boolean; categoryId: number }): Observable<Item> {
    return this.api.createItem(payload).pipe(
      tap(() => {
        this.loadCatalog();
        this.loadDashboard();
      })
    );
  }

  updateItem(id: number, payload: { name: string; price: number; inStock: boolean; categoryId: number }): Observable<Item> {
    return this.api.updateItem(id, payload).pipe(
      tap(() => {
        this.loadCatalog();
        this.loadDashboard();
      })
    );
  }

  downloadDailySalesReport(): Observable<HttpResponse<Blob>> {
    return this.api.getDailySalesReport();
  }

  private patchCustomer(customer: Customer): void {
    const patch = (list: Customer[]) => list.map((entry) => (entry.id === customer.id ? customer : entry));
    this.activeCustomers.update(patch);
    this.inactiveCustomers.update(patch);
  }

  private readError(error: unknown): string {
    const anyError = error as { error?: { message?: string } };
    return anyError?.error?.message ?? 'Something spicy went wrong. Please try again.';
  }
}

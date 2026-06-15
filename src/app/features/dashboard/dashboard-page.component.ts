import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BnbFacadeService } from '../../core/services/bnb-facade.service';
import { PaymentCalculatorService } from '../../core/services/payment-calculator.service';
import { Customer } from '../../core/models/customer.model';
import { CustomerModalComponent } from './customer-modal.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, CustomerModalComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.css']
})
export class DashboardPageComponent implements OnInit {
  readonly facade = inject(BnbFacadeService);
  private readonly paymentCalculator = inject(PaymentCalculatorService);

  activeTab: 'ACTIVE' | 'INACTIVE' = 'ACTIVE';
  searchTerm = '';
  newCustomerName = '';
  starterItemId: number | null = null;
  starterQuantity = 1;
  cardPayments: Record<number, number | null> = {};
  modalState: { mode: 'view' | 'edit'; customer: Customer } | null = null;
  bannerMessage = '';

  ngOnInit(): void {
    this.facade.loadDashboard();
  }

  get currentCustomers(): Customer[] {
    return this.activeTab === 'ACTIVE' ? this.facade.activeCustomers() : this.facade.inactiveCustomers();
  }

  setTab(tab: 'ACTIVE' | 'INACTIVE'): void {
    this.activeTab = tab;
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.facade.loadDashboard(value);
  }

  addCustomer(): void {
    const name = this.newCustomerName.trim();
    if (!name) {
      return;
    }

    const orderLines = this.starterItemId
      ? [{ itemId: this.starterItemId, quantity: Math.max(1, this.starterQuantity) }]
      : [];

    this.facade.createCustomer({ name, orderLines }).subscribe({
      next: () => {
        this.newCustomerName = '';
        this.starterItemId = null;
        this.starterQuantity = 1;
        this.bannerMessage = 'Fresh user added to Active orders.';
        this.activeTab = 'ACTIVE';
      },
      error: () => this.bannerMessage = 'Could not add user right now.'
    });
  }

  openModal(customer: Customer, mode: 'view' | 'edit'): void {
    this.modalState = { customer, mode };
  }

  closeModal(): void {
    this.modalState = null;
  }

  saveCustomerName(name: string): void {
    if (!this.modalState) {
      return;
    }
    this.facade.updateCustomerName(this.modalState.customer.id, name).subscribe({
      next: (updated) => this.modalState = this.modalState ? { ...this.modalState, customer: updated } : null
    });
  }

  addLine(payload: { itemId: number; quantity: number }): void {
    if (!this.modalState) {
      return;
    }
    this.facade.addOrderLine(this.modalState.customer.id, payload).subscribe({
      next: (updated) => this.modalState = this.modalState ? { ...this.modalState, customer: updated } : null
    });
  }

  removeLine(lineId: number): void {
    if (!this.modalState) {
      return;
    }
    this.facade.removeOrderLine(this.modalState.customer.id, lineId).subscribe({
      next: (updated) => this.modalState = this.modalState ? { ...this.modalState, customer: updated } : null
    });
  }

  paymentValue(customerId: number): number | null {
    return this.cardPayments[customerId] ?? null;
  }

  setPaymentValue(customerId: number, value: number | null): void {
    this.cardPayments[customerId] = value;
  }

  remainingAmount(customer: Customer): number {
    return this.paymentCalculator.remainingAmount(customer.totalBill, this.paymentValue(customer.id));
  }

  paymentComplete(customer: Customer): boolean {
    return this.paymentCalculator.isPaymentComplete(customer.totalBill, this.paymentValue(customer.id));
  }

  markPaid(customer: Customer): void {
    this.facade.changeCustomerStatus(customer.id, 'INACTIVE').subscribe({
      next: () => {
        this.bannerMessage = `${customer.name} moved to Inactive after payment.`;
        this.cardPayments[customer.id] = null;
      }
    });
  }

  backToActive(customer: Customer): void {
    this.facade.changeCustomerStatus(customer.id, 'ACTIVE').subscribe({
      next: () => this.bannerMessage = `${customer.name} is back to Active.`
    });
  }

  paymentLabel(customer: Customer): string {
    const remaining = this.remainingAmount(customer);
    if (remaining > 0) {
      return `Remaining ${this.formatMoney(remaining)}`;
    }
    if (remaining < 0) {
      return `Change due ${this.formatMoney(Math.abs(remaining))}`;
    }
    return 'Payment exact';
  }

  private formatMoney(value: number): string {
    return `₹${value.toFixed(2)}`;
  }
}

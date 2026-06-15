import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PaymentCalculatorService {
  remainingAmount(totalBill: number, amountPaid: number | null | undefined): number {
    const paid = Number.isFinite(amountPaid ?? NaN) ? Number(amountPaid) : 0;
    return Number((totalBill - paid).toFixed(2));
  }

  isPaymentComplete(totalBill: number, amountPaid: number | null | undefined): boolean {
    return this.remainingAmount(totalBill, amountPaid) <= 0;
  }
}

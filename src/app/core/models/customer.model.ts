import { OrderLine } from './order-line.model';

export interface Customer {
  id: number;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
  totalBill: number;
  orderLines: OrderLine[];
  createdAt: string;
  updatedAt: string;
}

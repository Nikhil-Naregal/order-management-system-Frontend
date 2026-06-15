import { CategoryRef } from './category.model';

export interface Item {
  id: number;
  name: string;
  price: number;
  inStock: boolean;
  category: CategoryRef;
}

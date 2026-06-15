export interface OrderLine {
  id: number;
  itemId: number;
  itemName: string;
  categoryName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

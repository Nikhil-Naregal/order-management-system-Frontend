import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Customer } from '../../core/models/customer.model';
import { Item } from '../../core/models/item.model';

@Component({
  selector: 'app-customer-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  templateUrl: './customer-modal.component.html',
  styleUrls: ['./customer-modal.component.css']
})
export class CustomerModalComponent {
  @Input({ required: true }) customer!: Customer;
  @Input({ required: true }) mode: 'view' | 'edit' = 'view';
  @Input() items: Item[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() saveName = new EventEmitter<string>();
  @Output() addLine = new EventEmitter<{ itemId: number; quantity: number }>();
  @Output() removeLine = new EventEmitter<number>();

  editableName = '';
  selectedItemId: number | null = null;
  quantity = 1;

  ngOnChanges(_changes: SimpleChanges): void {
    this.editableName = this.customer?.name ?? '';
    this.selectedItemId = this.items[0]?.id ?? null;
    this.quantity = 1;
  }

  get groupedItems(): Array<{ category: string; items: Item[] }> {
    const groups = new Map<string, Item[]>();
    for (const item of this.items) {
      const bucket = groups.get(item.category.name) ?? [];
      bucket.push(item);
      groups.set(item.category.name, bucket);
    }
    return Array.from(groups.entries()).map(([category, items]) => ({ category, items }));
  }

  get categoryHints(): string[] {
    return this.groupedItems.map((group) => group.category);
  }

  submitName(): void {
    const trimmed = this.editableName.trim();
    if (trimmed) {
      this.saveName.emit(trimmed);
    }
  }

  submitAddLine(): void {
    if (this.selectedItemId) {
      this.addLine.emit({ itemId: this.selectedItemId, quantity: Math.max(1, this.quantity) });
      this.quantity = 1;
    }
  }
}

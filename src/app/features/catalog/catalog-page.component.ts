import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BnbFacadeService } from '../../core/services/bnb-facade.service';
import { Item } from '../../core/models/item.model';

@Component({
  selector: 'app-catalog-page',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  templateUrl: './catalog-page.component.html',
  styleUrls: ['./catalog-page.component.css']
})
export class CatalogPageComponent implements OnInit {
  readonly facade = inject(BnbFacadeService);

  activeTab: 'ITEMS' | 'CATEGORIES' = 'ITEMS';
  categoryName = '';
  itemForm = {
    name: '',
    price: null as number | null,
    inStock: true,
    categoryId: null as number | null
  };
  editingId: number | null = null;
  editingDraft = {
    name: '',
    price: 0,
    inStock: true,
    categoryId: null as number | null
  };
  statusNote = '';

  ngOnInit(): void {
    this.facade.loadCatalog();
  }

  setTab(tab: 'ITEMS' | 'CATEGORIES'): void {
    this.activeTab = tab;
  }

  addCategory(): void {
    const name = this.categoryName.trim();
    if (!name) {
      return;
    }
    this.facade.createCategory(name).subscribe({
      next: () => {
        this.categoryName = '';
        this.statusNote = 'Category added successfully.';
      },
      error: () => this.statusNote = 'Category could not be saved.'
    });
  }

  addItem(): void {
    if (!this.itemForm.name.trim() || this.itemForm.price === null || this.itemForm.categoryId === null) {
      return;
    }
    this.facade.createItem({
      name: this.itemForm.name.trim(),
      price: Number(this.itemForm.price),
      inStock: this.itemForm.inStock,
      categoryId: this.itemForm.categoryId
    }).subscribe({
      next: () => {
        this.itemForm = { name: '', price: null, inStock: true, categoryId: null };
        this.statusNote = 'Item added successfully.';
      },
      error: () => this.statusNote = 'Item could not be saved.'
    });
  }

  startEdit(item: Item): void {
    this.editingId = item.id;
    this.editingDraft = {
      name: item.name,
      price: item.price,
      inStock: item.inStock,
      categoryId: item.category.id
    };
  }

  cancelEdit(): void {
    this.editingId = null;
  }

  saveItem(itemId: number): void {
    if (!this.editingDraft.name.trim() || this.editingDraft.categoryId === null) {
      return;
    }
    this.facade.updateItem(itemId, {
      name: this.editingDraft.name.trim(),
      price: Number(this.editingDraft.price),
      inStock: this.editingDraft.inStock,
      categoryId: this.editingDraft.categoryId
    }).subscribe({
      next: () => {
        this.statusNote = 'Item updated successfully.';
        this.editingId = null;
      },
      error: () => this.statusNote = 'Item update failed.'
    });
  }
}

import { Routes } from '@angular/router';
import { DashboardPageComponent } from './features/dashboard/dashboard-page.component';
import { CatalogPageComponent } from './features/catalog/catalog-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', component: DashboardPageComponent },
  { path: 'catalog', component: CatalogPageComponent },
  { path: '**', redirectTo: 'dashboard' }
];

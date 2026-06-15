import { computed, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly activeRequests = signal(0);
  readonly loading = computed(() => this.activeRequests() > 0);

  start(): void {
    this.activeRequests.update((current) => current + 1);
  }

  stop(): void {
    this.activeRequests.update((current) => Math.max(0, current - 1));
  }
}

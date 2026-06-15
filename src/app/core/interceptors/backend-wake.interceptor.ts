import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { mergeMap, retryWhen } from 'rxjs/operators';

@Injectable()
export class BackendWakeInterceptor implements HttpInterceptor {
  private readonly maxRetryAttempts = 20;
  private readonly baseRetryDelayMs = 5000;

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      retryWhen((errors) =>
        errors.pipe(
          mergeMap((error, attempt) => {
            if (!this.shouldRetry(req.url, error, attempt)) {
              return throwError(() => error);
            }

            const delay = this.baseRetryDelayMs * (attempt + 1);
            return timer(delay);
          })
        )
      )
    );
  }

  private shouldRetry(url: string | undefined, error: unknown, attempt: number): boolean {
    if (attempt >= this.maxRetryAttempts) {
      return false;
    }

    if (!url || !url.startsWith('/api')) {
      return false;
    }

    if (!(error instanceof HttpErrorResponse)) {
      return false;
    }

    if (error.status === 0) {
      return true;
    }

    return [502, 503, 504].includes(error.status);
  }
}

import { Injectable, Injector } from '@angular/core';
import {
  HttpErrorResponse, HttpInterceptor, HttpRequest, HttpHandler, HttpEvent
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { URL_SERVICIOS } from '../config/config'; // ojo a la ruta
import { AuthService } from '../pages/auth/service/auth.service';

function getTokenSSRSafe(): string | null {
  try {
    if (typeof sessionStorage === 'undefined') return null;
    return sessionStorage.getItem('token');
  } catch {
    return null;
  }
}

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private injector: Injector,
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = getTokenSSRSafe();

    // Evita errores si la constante no está definida por cualquier motivo
    const base = typeof URL_SERVICIOS === 'string' ? URL_SERVICIOS : '';
    const isApi = base && req.url.startsWith(base);

    const withAuth = (token && isApi)
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

    return next.handle(withAuth).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.injector.get(AuthService).handleUnauthorized();
        }
        return throwError(() => error);
      })
    );
  }
}

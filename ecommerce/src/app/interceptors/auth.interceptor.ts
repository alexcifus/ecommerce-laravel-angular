import { Injectable } from '@angular/core';
import {
  HttpInterceptor, HttpRequest, HttpHandler, HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { URL_SERVICIOS } from '../config/config'; // ojo a la ruta

function getTokenSSRSafe(): string | null {
  // En SSR no existe localStorage
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem('token');
  } catch {
    return null;
  }
}

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = getTokenSSRSafe();

    // Evita errores si la constante no está definida por cualquier motivo
    const base = typeof URL_SERVICIOS === 'string' ? URL_SERVICIOS : '';
    const isApi = base && req.url.startsWith(base);

    const withAuth = (token && isApi)
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

    return next.handle(withAuth);
  }
}

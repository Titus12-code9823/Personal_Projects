import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const authorizationHeader = authService.getAuthorizationHeader();

  if (!authorizationHeader || request.headers.has('Authorization')) {
    return next(request);
  }

  if (!request.url.startsWith('http://localhost:8080')) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: {
        Authorization: authorizationHeader
      }
    })
  );
};

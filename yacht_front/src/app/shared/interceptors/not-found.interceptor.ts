import { Injectable } from '@angular/core';
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpErrorResponse
} from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class NotFoundInterceptor implements HttpInterceptor {
    constructor(private readonly router: Router) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            catchError(() => {
                return next.handle(request).pipe(
                    catchError((error: HttpErrorResponse) => {
                      const tags: boolean = request.url.includes('tags') && error.status === 500;
                      const articles: boolean = request.url.includes('articles') && error.status === 422;
                      const tagsNotFound: boolean = request.url.includes('tags') && error.status === 404;
                      if (request.method === 'GET' && (tags || articles || error.status === 404 && !tagsNotFound)) {
                        this.router.navigateByUrl('/404');
                      }
                      return throwError(error);
                    }),
                );
            }),
        );
    }
}

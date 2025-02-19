import { OperatorFunction, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

export function notFound(router: Router): OperatorFunction<any, any> {
    return catchError((error: HttpErrorResponse) => {
        if (error.status === 404 || error.status === 422) {
            router.navigateByUrl('/404');
        }
        return throwError(error);
    });
}

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';
import { RecoverPasswordService } from '@api/routes/recovery.service';

@Injectable({
  providedIn: 'root',
})
export class RecoveryGuard implements CanActivate {
  constructor(private readonly router: Router, private readonly recovery: RecoverPasswordService) {}

  public canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const code: string = route.queryParams.code;
    const email: string = route.queryParams.email;

    if (!code || !email) {
      this.router.navigate(['/']);
    }

    return this.recovery.check$(code, email).pipe(
      catchError(() => this.router.navigate(['/'])),
      mergeMap(() => of(true)),
    );
  }
}

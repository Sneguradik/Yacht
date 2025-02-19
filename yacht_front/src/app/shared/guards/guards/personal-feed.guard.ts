import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { SessionService } from '@app/services/session.service';

@Injectable({
  providedIn: 'root',
})
export class PersonalFeedGuard implements CanActivate {
  constructor(private readonly sessionService: SessionService, private readonly router: Router) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.sessionService.loggedIn$.pipe(
      first(),
      map((value: boolean) => (value ? true : this.router.parseUrl('/all'))),
    );
  }
}

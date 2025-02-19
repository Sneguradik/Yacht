import { Injectable } from '@angular/core';
import { CanActivate, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SessionService } from '@app/services/session.service';
import { IUserViewFull } from '@api/schemas/user/user-view-full.interface';

@Injectable({
  providedIn: 'root',
})
export class SuperUserGuard implements CanActivate {
  constructor(
    private readonly session: SessionService
  ) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
   return this.session.user$.pipe(
     map((user: IUserViewFull) => (user !== null ? user.roles.indexOf('ROLE_SUPERUSER') !== -1 : false)));
  }
}

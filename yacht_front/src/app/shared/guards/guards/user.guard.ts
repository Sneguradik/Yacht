import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { SessionService } from '@app/services/session.service';
import { IUserViewFull } from '@api/schemas/user/user-view-full.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserGuard implements CanActivate {
  constructor(private readonly router: Router, private readonly session: SessionService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<any> {
    const id: string = route.params['id'];

    if (id === 'me') {
      return this.session.user$
        .pipe(
          map((user: IUserViewFull) => {
            let sub: string = state.url;
            if (sub.includes('/user/me/')) {
              sub = sub.replace('/user/me/', '');
            } else if (sub.includes('/company/me/')) {
              sub = sub.replace('/company/me/', '');
            }
            const url: any[] =
              [user.info.company.isCompany ? '/company' : '/user', user.info.username ? user.info.username : user.meta.id, sub];
            this.router.navigate(url);
          }),
        );
    } else {
      return true;
    }
  }
}

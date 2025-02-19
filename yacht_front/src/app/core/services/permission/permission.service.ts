import { Injectable } from '@angular/core';
import { SessionService } from '../session.service';
import { IUserViewFull } from '@api/schemas/user/user-view-full.interface';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ROLES } from './roles.const';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  public readonly roles: typeof ROLES = ROLES;

  constructor(private readonly sessionService: SessionService) { }

  public get isLoggedIn(): boolean {
    return this.sessionService.loggedIn$.value;
  }

  public hasAnyRole(user: IUserViewFull, ...roles: (string | string[])[]): boolean {
    let result = false;

    if (user && user.roles && user.roles.includes(this.roles.SUPERUSER)) {
      result = true;
    } else if (user && user.roles && roles) {
      for (const role of roles.reduce((s: string[], i: string | string[]) => {
        if (Array.isArray(i)) {
          s.push(...i);
        } else {
          s.push(i);
        }
        return s;
      }, [])) {
        if (user.roles.includes(role)) {
          result = true;
        }
      }
    }

    return result;
  }

  public hasAnyRole$(...roles: (string | string[])[]): Observable<boolean> {
    return this.sessionService.user$.pipe(map((user: IUserViewFull) => this.hasAnyRole(user, ...roles)));
  }
}

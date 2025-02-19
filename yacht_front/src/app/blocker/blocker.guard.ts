import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SessionService } from '@app/services/session.service';
import { map, tap } from 'rxjs/operators';
import { IUserViewFull } from '@api/schemas/user/user-view-full.interface';

@Injectable({
  providedIn: 'root'
})
export class BlockerGuard implements CanActivate {
  constructor(
    private readonly sessionService: SessionService,
    private readonly router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.sessionService.user$.pipe(
      map((user: IUserViewFull) => user?.roles.includes('ROLE_SUPERUSER')),
      tap((res: boolean) => {
        if (!res) {
          this.router.navigate(['/blocker']);
        }
      })
    );
  }
}

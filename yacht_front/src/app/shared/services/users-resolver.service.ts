import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { IUserViewFull } from '@api/schemas/user/user-view-full.interface';
import { UsersService } from '@api/routes/users.service';
import { Observable } from 'rxjs';
import { notFound } from '@shared/utils/not-found.operator';

@Injectable({
  providedIn: 'root'
})
export class UsersResolverService implements Resolve<IUserViewFull> {
  constructor(
    private readonly usersService: UsersService,
    private readonly router: Router
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<IUserViewFull> {
    return this.usersService.getSingle$(route.params.id).pipe(notFound(this.router));
  }
}

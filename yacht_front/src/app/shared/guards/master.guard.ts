import { Injectable, Injector } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Data,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { PlatformService } from '@shared/services/platform.service';
import { switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class MasterGuard implements CanActivate, CanActivateChild {

  private route: ActivatedRouteSnapshot;
  private state: RouterStateSnapshot;
  private executor: 'canActivate' | 'canActivateChild';
  private relation: 'OR' | 'AND' = 'AND';

  constructor(private readonly injector: Injector,
              private readonly platformService: PlatformService,
              private readonly router: Router) {
  }

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    if (this.platformService.isServer) {
      return of(true);
    }
    this.executor = 'canActivate';
    this.route = route;
    this.state = state;
    return this.middleware().pipe(tap((res: boolean) => {
      if (!res && this.route.data.alternativeRoute) {
        this.router.navigateByUrl(this.route.data.alternativeRoute);
      }
    }));
  }

  public canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    if (this.platformService.isServer) {
      return of(true);
    }
    this.executor = 'canActivateChild';
    this.route = route;
    this.state = state;
    return this.middleware();
  }

  private middleware(): Observable<boolean> {

    const data = this.findDataWithGuards(this.route);

    if (!data.guards || !data.guards.length) {
      return of(true);
    }

    if (typeof this.route.data.guardsRelation === 'string') {
      this.relation = this.route.data.guardsRelation.toUpperCase() === 'OR' ? 'OR' : 'AND';
    } else {
      this.relation = (data.guardsRelation === 'string' && data.guardsRelation.toUpperCase() === 'OR') ? 'OR' : 'AND';
    }

    return this.executeGuards(data.guards);
  }

  private findDataWithGuards(route: ActivatedRouteSnapshot): Data {

    if (route.data.guards) {
      return route.data;
    }

    // tslint:disable:no-bitwise
    if ( (route.routeConfig.canActivateChild && ~route.routeConfig.canActivateChild.findIndex((guard: any) => this instanceof guard))
      || (route.routeConfig.canActivate && ~route.routeConfig.canActivate.findIndex((guard: any) => this instanceof guard)) ) {
      return route.data;
    }
    // tslint:enable:no-bitwise

    return this.findDataWithGuards(route.parent);
  }

  private executeGuards(guards: any, guardIndex: number = 0): Observable<boolean> {
    return this.activateGuard(guards[guardIndex]).pipe(
      switchMap((result: boolean) => {
        if (this.relation === 'AND' && !result) {
          return of(false);
        }
        if (this.relation === 'OR' && result) {
          return of(true);
        }
        if (guardIndex < guards.length - 1) {
          return this.executeGuards(guards, guardIndex + 1);
        } else {
          return of(result);
        }
      })
    );
  }

  private activateGuard(token: any): Observable<boolean> {
    const guard = this.injector.get<any>(token);

    let result: Observable<boolean> | boolean;
    switch (this.executor) {
      case 'canActivate':
        result = guard.canActivate(this.route, this.state);
        break;

      case 'canActivateChild':
        result = guard.canActivateChild(this.route, this.state);
        break;

      default:
        result = guard.canActivate(this.route, this.state);
        break;
    }

    if (typeof result === 'boolean') {
      return of(result);
    }

    return result;
  }
}

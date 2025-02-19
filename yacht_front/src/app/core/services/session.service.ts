import { Injectable } from '@angular/core';
import { BehaviorSubject, of, ReplaySubject } from 'rxjs';
import { distinctUntilChanged, map, switchMap, catchError } from 'rxjs/operators';
import { TokenService } from './token.service';
import { UsersService } from '@api/routes/users.service';
import { IUserViewFull } from '@api/schemas/user/user-view-full.interface';

interface IClaims {
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  public readonly userIdSubject$: BehaviorSubject<number> = new BehaviorSubject<number>(null);
  public readonly userId$: ReplaySubject<number> = new ReplaySubject<number>(1);
  public readonly user$: ReplaySubject<IUserViewFull> = new ReplaySubject<IUserViewFull>(1);

  public readonly loggedIn$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public get userId(): number | null {
    return this.userIdSubject$.value;
  }

  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService
  ) {
    this.initUser();

    this.userId$.subscribe(this.userIdSubject$);
    this.user$.pipe(map((user: IUserViewFull) => !!user)).subscribe(this.loggedIn$);
  }

  private initUser(): void {
    this.tokenService.claims.pipe(
      distinctUntilChanged((x: IClaims, y: IClaims) => {
        return !((x === null) !== (y === null) || (x && y && x.sub !== y.sub));
      }),
      map((claims: IClaims) => (claims ? +claims.sub : null))
    ).subscribe(this.userId$);

    this.userId$.pipe(
      switchMap((id: number) => (id ? this.usersService.me$() : of(null))),
      catchError(() => {
        return of(null);
      })
    ).subscribe(this.user$);
  }

  public clear(): void {
    this.tokenService.clear();
  }
}

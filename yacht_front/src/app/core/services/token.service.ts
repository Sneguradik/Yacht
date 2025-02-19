import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { PlatformService } from '@shared/services/platform.service';
import { IApiTokens } from '@app/interfaces/api-tokens.interface';
import { Jwt } from '@app/classes/jwt.class';
import { LocalStorageKeyEnum } from '@shared/enums/local-storage-key.enum';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  // tslint:disable-next-line:variable-name
  private readonly _claims: BehaviorSubject<{ [key: string]: any }> = new BehaviorSubject<{ [key: string]: any }>(null);
  private readonly grants: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  private tokens: IApiTokens = { access: null, refresh: null };

  public readonly tokens$ = new BehaviorSubject<IApiTokens>(null);

  public get expired(): boolean {
    return Date.now() / 1000 > this._claims.value.exp;
  }

  public get empty(): boolean {
    return this.tokens.access === null;
  }

  public get access(): string {
    return this.tokens.access;
  }

  public get refresh(): string {
    return this.tokens.refresh;
  }

  public get claims(): BehaviorSubject<{ [key: string]: any }> {
    return this._claims;
  }

  constructor(private readonly platformService: PlatformService, private readonly cookieService: CookieService) {
    if (this.platformService.isBrowser) {
      this.tokens$.subscribe((tokens: IApiTokens) => {
        if (!!tokens) {
          this.cookieService.set('access', tokens.access);
          this.cookieService.set('refresh', tokens.refresh);
        } else {
          this.cookieService.delete('access');
          this.cookieService.delete('refresh');
        }
      });
      this.load();
      fromEvent(window, 'storage').subscribe((e: StorageEvent) => {
        if (e.key === 'token.refresh') {
          this.load();
        }
      });
    } else if (this.platformService.isServer) {
      this.loadFromCookies();
    }
  }

  private update(): void {
    if (this.tokens.access && this.tokens.refresh) {
      const accessJwt = new Jwt(this.tokens.access);
      const claims = accessJwt.data;
      this.claims.next(claims);
      this.grants.next(claims.rol);
      this.tokens$.next({ ...this.tokens });
    } else {
      this.claims.next(null);
      this.grants.next(null);
      this.tokens$.next(null);
    }
  }

  private loadFromCookies(): void {
    this.tokens.access = this.cookieService.check('access') ? this.cookieService.get('access') : null;
    this.tokens.refresh = this.cookieService.check('refresh') ? this.cookieService.get('refresh') : null;
    this.update();
  }

  public load(): void {
    this.tokens.access = localStorage.getItem(LocalStorageKeyEnum.TOKEN_ACCESS);
    this.tokens.refresh = localStorage.getItem(LocalStorageKeyEnum.TOKEN_REFRESH);
    this.update();
  }

  public save(tokens: IApiTokens): void {
    this.tokens = tokens;
    const accessJwt = new Jwt(tokens.access);
    this.claims.next(accessJwt.data);
    this.grants.next(accessJwt.data.rol);
    localStorage.setItem(LocalStorageKeyEnum.TOKEN_ACCESS, tokens.access);
    localStorage.setItem(LocalStorageKeyEnum.TOKEN_REFRESH, tokens.refresh);
    this.tokens$.next({ ...this.tokens });
  }

  public clear(): void {
    this.tokens.access = null;
    this.tokens.refresh = null;
    this.claims.next(null);
    this.grants.next(null);
    this.tokens$.next(null);
    if (this.platformService.isBrowser) {
      localStorage.removeItem(LocalStorageKeyEnum.TOKEN_ACCESS);
      localStorage.removeItem(LocalStorageKeyEnum.TOKEN_REFRESH);
    }
  }
}

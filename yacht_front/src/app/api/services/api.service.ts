import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ReplaySubject, Observable, of, MonoTypeOperatorFunction } from 'rxjs';
import { environment } from '@env';
import { first, catchError, map, switchMap } from 'rxjs/operators';
import { TokenService } from '@app/services/token.service';
import { FingerprintService } from './fingerprint.service';
import { IApiTokens } from '@app/interfaces/api-tokens.interface';
import { IHeaders } from '@api/interfaces/headers.interface';
import { AnyParamsType } from '@api/types/params.type';
import { toAngularParams } from '@api/functions/to-angular-params.function';
import { ApiMethodEnum } from '@api/enums/api-method.enum';
import { PlatformService } from '@shared/services/platform.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private freshHeaders$: ReplaySubject<IHeaders> = null;

  constructor(
    private readonly http: HttpClient,
    private readonly tokens: TokenService,
    private readonly finger: FingerprintService,
    private readonly platformService: PlatformService
  ) { }

  private get headers(): IHeaders {
    let result: IHeaders = {};
    if (!this.tokens.empty) {
      result = { Authorization: `Bearer ${this.tokens.access}` };
    }
    return result;
  }

  private simpleMethod$<T>(method: ApiMethodEnum, params: any): Observable<T> {
    return this.refresh$(params.allowAnonymous).pipe(
      switchMap((_: IHeaders) => {
        let result: Observable<any>;
        switch (method) {
          case ApiMethodEnum.GET:
            result = this.http.get(environment.apiUrl + params.url, { headers: _, params: toAngularParams(params.params) });
            break;
          case ApiMethodEnum.POST:
            result = this.http.post(environment.apiUrl + params.url, params.body, { headers: _ });
            break;
          case ApiMethodEnum.PATCH:
            result = this.http.patch(environment.apiUrl + params.url, params.body, { headers: _ });
            break;
          case ApiMethodEnum.PUT:
            result = this.http.put(environment.apiUrl + params.url, params.body, { headers: _ });
            break;
          case ApiMethodEnum.DELETE:
            result = this.http.delete(environment.apiUrl + params.url, { headers: _ });
            break;
        }
        return result;
      }),
      this.catch401(),
      map((_: any) => _ as T),
    );
  }

  private refresh$(allowAnonymous: boolean): Observable<IHeaders> {
    let result: Observable<IHeaders>;

    if (this.tokens.empty) {
      if (!allowAnonymous) {
        throw new Error('Access Denied: Trying to access non-anonymous API without authentication');
      }
      result = of(this.headers);
    } else if (!this.tokens.expired) {
      result = of(this.headers);
    } else if (this.freshHeaders$) {
      result = this.freshHeaders$;
    } else {
      const $: ReplaySubject<IHeaders> = new ReplaySubject<IHeaders>(1);
      this.freshHeaders$ = $;
      if (this.platformService.isBrowser) {
        this.http.post(`${ environment.apiUrl }token/refresh`, {
          refreshToken: this.tokens.refresh,
        }).subscribe({
          error: () => {
            this.freshHeaders$.next({});
            this.freshHeaders$ = null;
            this.tokens.clear();
          },
          next: (tokens: IApiTokens) => {
            this.freshHeaders$.next({ Authorization: `Bearer ${ tokens.access }` });
            this.freshHeaders$ = null;
            this.tokens.save(tokens);
          },
        });
      } else if (this.platformService.isServer) {
        this.freshHeaders$.next({});
        this.freshHeaders$ = null;
        this.tokens.clear();
      }

      result = $.pipe(first());
    }

    return result;
  }

  private catch401<T>(): MonoTypeOperatorFunction<T> {
    return (source: Observable<T>) => {
      return source.pipe(catchError((error: any) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.tokens.clear();
        }
        throw error;
      }));
    };
  }

  public fingerprintAnonymousRequest$(base: string, hasQuery: boolean = false): Observable<string> {
    let result: Observable<string>;
    if (this.tokens.empty) {
      const add: string = (hasQuery ? '&' : '?') + 'f=';
      result = this.finger.fingerprint$.pipe(map((fp: string) => base + add + fp));
    } else {
      result = of(base);
    }
    return result;
  }

  public get$<T>(url: string, allowAnonymous: boolean = false, params?: AnyParamsType): Observable<T> {
    return this.simpleMethod$(ApiMethodEnum.GET, { url, allowAnonymous, params });
  }

  public post$<T = never>(url: string, body?: any, allowAnonymous: boolean = false): Observable<T> {
    return this.simpleMethod$(ApiMethodEnum.POST, { url, body, allowAnonymous });
  }

  public put$<T = never>(url: string, body?: any, allowAnonymous: boolean = false): Observable<T> {
    return this.simpleMethod$(ApiMethodEnum.PUT, { url, body, allowAnonymous });
  }

  public patch$<T = never>(url: string, body?: any, allowAnonymous: boolean = false): Observable<T> {
    return this.simpleMethod$(ApiMethodEnum.PATCH, { url, body, allowAnonymous });
  }

  public delete$<T = never>(url: string, allowAnonymous: boolean = false): Observable<T> {
    return this.simpleMethod$(ApiMethodEnum.DELETE, { url, allowAnonymous });
  }
}

import { Inject, Injectable, Optional } from '@angular/core';
import { REQUEST } from '@nguniversal/express-engine/tokens';
import { Request } from 'express'

@Injectable({
  providedIn: 'root'
})
export class CookiesServerService {
  constructor(
    @Optional() @Inject(REQUEST) private readonly request: Request
  ) {}

  public check(name: string): boolean {
    const cookies = this.getAll();
    return cookies ? !!cookies[name] : false;
  }

  public get(name: string): string {
    const cookies = this.getAll();
    return cookies ? cookies[name] || '' : '';
  }

  public getAll(): any {
    if (!this.request.headers.cookie) {
      return null;
    }
    return typeof this.request.headers.cookie === 'string'
      ? decodeURIComponent(this.request.headers.cookie).split(';').reduce((cookies: any, cookie: string) => {
        const val = cookie.split('=');
        return { ...cookies, [val[0].trim()]: val[1] };
      }, {})
      : { cookies: (this.request.headers.cookie as any).map(decodeURIComponent) }
  }
}

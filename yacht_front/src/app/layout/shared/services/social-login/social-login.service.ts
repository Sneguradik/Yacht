import { Injectable } from '@angular/core';
import { AuthService } from '@api/routes/auth.service';
import { Observable, of, from, BehaviorSubject, Subscriber } from 'rxjs';
import { environment } from '@env';
import { catchError, map, switchMap } from 'rxjs/operators';
import { PlatformService } from '@shared/services/platform.service';
import { LoginSocialConnectService } from '../login-social-connect.service';
import { IVkLoginResponse } from './vk-login-response.interface';
import { IFacebookLoginResponse } from './facebook-login-response.interface';
import { Router } from '@angular/router';
import { Jwt } from '@app/classes/jwt.class';

declare const VK: any;
declare const FB: any;
declare const gapi: any;


@Injectable({
  providedIn: 'root'
})
export class SocialLoginService {
  private readonly onVkApiLoaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private readonly onFbApiLoaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private readonly onGoogleApiLoaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly authService: AuthService,
    private readonly loginSocialConnectService: LoginSocialConnectService,
    private readonly platformService: PlatformService,
    private readonly router: Router
  ) {
    if (this.platformService.isBrowser) {
      this.initFacebookApi();
      this.initGoogleApi();
      this.initVkApi();
      this.loadedSub();
      window['openLoginWindow'] = () => {
        this.loginSocialConnectService.doSocialLogin$('google', {});
      };
    }
  }

  private loadedSub(): void {
    this.onGoogleApiLoaded$.subscribe((_: boolean) => {
      if (_) {
        gapi.load('auth2', () => {
          gapi.auth2.init({
            client_id: environment.googleApiAuth2ClientId,
          });
        });
      }
    });

    this.onVkApiLoaded$.subscribe((_: boolean) => {
      if (_) {
        VK.init({
          apiId: environment.vkAppId,
        });
      }
    });
  }

  private injectScript(src: string): void {
    const s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = src;
    s.async = true;
    s.defer = true;
    document.getElementsByTagName('head')[0].appendChild(s);
  }

  private initFacebookApi(): void {
    (window as any).fbAsyncInit = () => {
      FB.init({
        appId: environment.facebookAppId,
        autoLogAppEvents: true,
        xfbml: true,
        version: 'v4.0',
      });
      this.onFbApiLoaded$.next(true);
    };
    this.injectScript('https://connect.facebook.net/en_US/sdk.js');
  }

  private initGoogleApi(): void {
    (window as any).initGoogleApi = () => {
      this.onGoogleApiLoaded$.next(true);
    };
    this.injectScript('https://apis.google.com/js/platform.js?onload=initGoogleApi');
  }

  private initVkApi(): void {
    (window as any).vkAsyncInit = () => {
      this.onVkApiLoaded$.next(true);
    };
    const vkApiTransport = document.createElement('div');
    vkApiTransport.style.position = 'fixed';
    vkApiTransport.style.left = '-100000px';
    document.getElementsByTagName('body')[0].appendChild(vkApiTransport);
    this.injectScript('https://vk.com/js/api/openapi.js?162');
  }

  private tryLogin$(method: string, body: any): Observable<any> {
    return this.authService.exists$(method, body).pipe(
      switchMap((exists: boolean) => {
        let result: Observable<any>;
        if (exists) {
          result = this.loginSocialConnectService.login$(method, body);
        } else {
          this.loginSocialConnectService.doSocialLogin$(method, body);
          result = of(null);
        }
        return result;
      }),
      catchError((error: any) => {
        throw error;
      }),
    );
  }

  public loginWithGoogle(): void {
    this.getGoogle$()
      .pipe(switchMap((body: any) => this.tryLogin$('google', body)))
      .subscribe(() => this.router.navigate(['/all']));
  }

  public loginWithFacebook(): void {
    this.getFacebook$()
      .pipe(switchMap((body: any) => this.tryLogin$('facebook', body)))
      .subscribe(() => this.router.navigate(['/all']));
  }

  public loginWithVk(): void {
    this.getVk$()
      .pipe(switchMap((body: any) => this.tryLogin$('vk', body)))
      .subscribe(() => this.router.navigate(['/all']));
  }

  public goToTgAuthPage(): void {
    const tgAuthPathname = 'https://oauth.telegram.org/auth';
    const baseUrl = environment.url.replace(/\/$/, '');
    const tgAuthUrl = tgAuthPathname +
      `?bot_id=${environment.tgBotId}&origin=${baseUrl}&return_to=${baseUrl}/all`;
    window.location.href = tgAuthUrl;
  }

  public loginWithTg(): void {
    this.getTg$()
      .pipe(switchMap((body: any) => this.tryLogin$('tg', body)))
      .subscribe(() => this.router.navigate(['/all']));
  }

  public getGoogle$(): Observable<any> {
    gapi.auth2.getAuthInstance().disconnect();
    return from(gapi.auth2.getAuthInstance().signOut()).pipe(
      switchMap(() => from(gapi.auth2.getAuthInstance().signIn())),
      map((_: gapi.auth2.GoogleUser) => {
        return { idToken: _.getAuthResponse().id_token };
      }),
    );
  }

  public getVk$(): Observable<any> {
    return new Observable<any>((subscriber: Subscriber<any>) => {
      VK.Auth.login(async (response: IVkLoginResponse) => {
        if (response.status === 'connected') {
          const s = response.session;
          subscriber.next({
            expire: s.expire,
            mid: s.mid,
            secret: s.secret,
            sid: s.sid,
            sig: s.sig,
          });
          subscriber.complete();
        } else {
          subscriber.error(response.status);
        }
      });
    });
  }

  public getFacebook$(): Observable<any> {
    return new Observable<any>((subscriber: Subscriber<any>) => {
      FB.login((response: IFacebookLoginResponse) => {
        if (response.status === 'connected') {
          subscriber.next({
            signedRequest: response.authResponse.signedRequest,
          });
          subscriber.complete();
        } else {
          subscriber.error(response.status);
        }
      });
    });
  }

  public getTg$(): Observable<Record<string, string | number>> {
    const hash = decodeURIComponent(window.location.hash.split('#')[1]);
    const tgAuthResult = hash.match(/tgAuthResult=([A-z0-9]+)/)[1];

    return of(new Jwt(tgAuthResult, false).data);
  }
}

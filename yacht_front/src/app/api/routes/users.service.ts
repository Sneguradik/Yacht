import { Injectable } from '@angular/core';
import { IUserQuery } from '@api/schemas/user/user-query.interface';
import { ApiService } from '@api/services/api.service';
import { BaseStatus } from '@api/classes/base-status/base-status.class';
import { Observable, throwError, Subscriber } from 'rxjs';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { map, catchError, switchMap } from 'rxjs/operators';
import { IUploadImageResponse } from '@api/schemas/image/upload-image-response.interface';
import { IUserViewFull } from '@api/schemas/user/user-view-full.interface';
import { IUserView } from '@api/schemas/user/user-view.interface';
import { ICommentViewFeed } from '@api/schemas/comment/comment-view-feed.interface';
import qs from 'qs';
import { IApiTokens } from '@app/interfaces/api-tokens.interface';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '@env';
import { EMAIL_TAKEN, USERNAME_TAKEN, UNKNOWN_ERROR } from '@api/constants/errors.const';
import { fileToFormData } from '@api/functions/file-to-formdata.function';
import { IFacebookLoginResponse } from '@layout/shared/services/social-login/facebook-login-response.interface';
import { BaseStatusActionEnum } from '@api/classes/base-status/base-status-action.enum';
import { Store } from '@ngxs/store';

declare const FB: any;
const CONTROLLER_ENDPOINT = 'users';

@Injectable({
  providedIn: 'root'
})
export class UsersService extends BaseStatus {
  constructor(
    protected readonly apiService: ApiService,
    protected readonly store: Store,
    private readonly http: HttpClient
  ) {
    super(apiService, CONTROLLER_ENDPOINT, store);
  }

  private uploadImage$(image: File, url: string): Observable<IUploadImageResponse> {
    return this.apiService.put$<IUploadImageResponse>(url, fileToFormData(image));
  }

  public get$(page: number = 0, query: IUserQuery = {}): Observable<IPageResponse<IUserView>> {
    return this.apiService.get$<IPageResponse<IUserView>>(CONTROLLER_ENDPOINT, true, { locale: 'RUSSIAN', ...query, company: false, page });
  }

  public getSingle$(id: number | string): Observable<IUserViewFull> {
    if (typeof id === 'string' && /^\d+$/.test(id)) {
      id = parseInt(id, 10);
    }
    return this.apiService.get$<IUserViewFull>(`${ CONTROLLER_ENDPOINT }/${ typeof id === 'number' ? `id${ id }` : id }`, true);
  }

  public me$(): Observable<IUserViewFull> {
    return this.apiService.get$<IUserViewFull>(`${ CONTROLLER_ENDPOINT }/me`);
  }

  public comments$(page: number = 0, id: number, query?: any): Observable<IPageResponse<ICommentViewFeed>> {
    return this.apiService.get$<IPageResponse<ICommentViewFeed>>(`${ CONTROLLER_ENDPOINT }/${ id }/comments?${ qs.stringify({ page, ...query }) }`, true);
  }

  public importFBPicture$(body: any): Observable<IUploadImageResponse> {
    return this.apiService.put$<IUploadImageResponse>(`${ CONTROLLER_ENDPOINT }/me/picture/import/facebook`, body);
  }

  public commentCount$(id: number): Observable<number> {
    return this.apiService.get$<{ count: any }>(`${ CONTROLLER_ENDPOINT }/${ id }/comments/count`, true)
      .pipe(map((_: { count: any }) => _.count));
  }

  public updateProfile$(update: any, id?: number): Observable<never> {
    return this.apiService.patch$<never>(id ? `${ CONTROLLER_ENDPOINT }/private/${ id }` : `${ CONTROLLER_ENDPOINT }/me`, update, false);
  }

  public setUsername$(username: string, id?: number): Observable<never> {
    return this.apiService.put$<never>(id ? `${ CONTROLLER_ENDPOINT }/private/${ id }/username`
      : `${ CONTROLLER_ENDPOINT }/me/username`, { username });
  }

  public delete$(id: number): Observable<never> {
    return this.apiService.delete$<never>(`${ CONTROLLER_ENDPOINT }/${ id }`);
  }

  public setRole$(id: number, role: string, status: boolean): Observable<never> {
    return status
      ? this.apiService.post$<never>(`${ CONTROLLER_ENDPOINT }/${ id }/roles/${ role }`)
      : this.apiService.delete$(`${ CONTROLLER_ENDPOINT }/${ id }/roles/${ role }`);
  }

  public connectSocial$(currentMethod: string, currentBody: any): Observable<any> {
    return this.apiService.post$<any>(`${ CONTROLLER_ENDPOINT }/me/connect/${ currentMethod }`, currentBody);
  }

  public resetInit$(email: string): Observable<never> {
    return this.apiService.post$<never>(`${ CONTROLLER_ENDPOINT }/reset`, { email }, true);
  }

  public resetCheck$(hash: string, email: string): Observable<never> {
    return this.apiService.get$<never>(`${ CONTROLLER_ENDPOINT }/reset?hash=${ hash }&email=${ email }`, true);
  }

  public resetChange$(hash: string, email: string, password: string): Observable<never> {
    return this.apiService.post$<never>(`${ CONTROLLER_ENDPOINT }/reset/change`, { email, password, hash }, true);
  }

  public setUserRole$(id: number, role: string, status: boolean): Observable<never> {
    return status
      ? this.apiService.post$(`${ CONTROLLER_ENDPOINT }/${ id }/roles/${ role }`)
      : this.apiService.delete$(`${ CONTROLLER_ENDPOINT }/${ id }/roles/${ role }`);
  }

  public registerSocial$(currentMethod: string, currentBody: any): Observable<IApiTokens> {
    return this.http.post<IApiTokens>(`${ environment.apiUrl + CONTROLLER_ENDPOINT }/register/social/${ currentMethod }`, currentBody);
  }

  public register$(firstName: string, lastName: string, email: string, password: string, username?: string): Observable<IApiTokens> {
    return this.http.post<IApiTokens>(environment.apiUrl + `${ CONTROLLER_ENDPOINT }/register`,
      { firstName, lastName, username, password, email, }).pipe(
      catchError((error: HttpErrorResponse) => {
        switch (error.error.message) {
          case 'Username already in use':
            return throwError({ cause: USERNAME_TAKEN });
          case 'Email address already in use':
            return throwError({ cause: EMAIL_TAKEN });
          default:
            return throwError({ cause: UNKNOWN_ERROR, error });
        }
      })
    );
  }

  public ban$(id: number, banned: boolean): Observable<never> {
    return this.toggleStatus$(id, BaseStatusActionEnum.BAN, !banned);
  }

  public setCompanyStatus$(id: number, company: boolean): Observable<never> {
    return this.toggleStatus$(id, BaseStatusActionEnum.COMPANY, !company);
  }

  public updateCover$(file: File, id?: number): Observable<IUploadImageResponse> {
    return this.uploadImage$(file, id ? `${ CONTROLLER_ENDPOINT }/private/${ id }/cover` : `${ CONTROLLER_ENDPOINT }/me/cover`);
  }

  public updateAvatar$(file: File, id?: number): Observable<IUploadImageResponse> {
    return this.uploadImage$(file, id ? `${ CONTROLLER_ENDPOINT }/private/${ id }/picture` : `${ CONTROLLER_ENDPOINT }/me/picture`);
  }

  public setFBPicture$(): Observable<IUploadImageResponse> {
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
    }).pipe(switchMap((body: any) => this.apiService.put$(`${ CONTROLLER_ENDPOINT }/me/picture/import/facebook`, body)));
  }
}

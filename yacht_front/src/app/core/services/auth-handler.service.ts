import { Injectable } from '@angular/core';
import { AuthService } from '@api/routes/auth.service';
import { LoginService } from './login.service';
import { Observable, throwError } from 'rxjs';
import { IUserView } from '@api/schemas/user/user-view.interface';
import { IApiTokens } from '@app/interfaces/api-tokens.interface';
import { switchMap, catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { WRONG_SUBJECT_ERROR, WRONG_PASSWORD_ERROR, UNKNOWN_ERROR } from '@api/constants/errors.const';

@Injectable({
  providedIn: 'root'
})
export class AuthHandlerService {
  constructor(private readonly authService: AuthService, private readonly loginService: LoginService) { }

  public loginSocial$(method?: string, body?: any): Observable<IUserView>  {
    return this.authService.loginSocial$(method, body).pipe(
      switchMap((_: IApiTokens) => this.loginService.login$(_)),
    );
  }

  public login$(subject: string, password: string): Observable<IApiTokens> {
    return this.authService.login$(subject, password).pipe(
      catchError((error: HttpErrorResponse) => {
        switch (error.status) {
          case 404:
            return throwError({ cause: WRONG_SUBJECT_ERROR });
          case 401:
            return throwError({ cause: WRONG_PASSWORD_ERROR });
          default:
            return throwError({ cause: UNKNOWN_ERROR, error });
        }
      })
    );
  }
}

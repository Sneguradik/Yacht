import { Injectable } from '@angular/core';
import { UsersService } from '@api/routes/users.service';
import { Observable } from 'rxjs';
import { IUserView } from '@api/schemas/user/user-view.interface';
import { switchMap } from 'rxjs/operators';
import { IApiTokens } from '@app/interfaces/api-tokens.interface';
import { LoginService } from '@app/services/login.service';
import { AuthHandlerService } from '@app/services/auth-handler.service';
import { LoginSocialConnectComponent } from '@layout/login-social-connect/login-social-connect.component';

@Injectable({
  providedIn: 'root'
})
export class LoginSocialConnectService {
  private currentMethod: string;
  private currentBody: any;

  public component: LoginSocialConnectComponent;

  constructor(
    private readonly authHandlerService: AuthHandlerService,
    private readonly usersService: UsersService,
    private readonly loginService: LoginService
  ) {}

  public doSocialLogin$(method: string, body: any): void {
    this.currentBody = body;
    this.currentMethod = method;
    this.component.shown = true;
    this.component.showConnect = false;
  }

  public register$(): Observable<IUserView> {
    return this.usersService.registerSocial$(this.currentMethod, this.currentBody)
      .pipe(switchMap((token: IApiTokens) => this.loginService.login$(token)));
  }

  public login$(method?: string, body?: any): Observable<IUserView> {
    return this.authHandlerService.loginSocial$(method, body);
  }

  public connect$(): Observable<any> {
    return this.usersService.connectSocial$(this.currentMethod, this.currentBody);
  }
}

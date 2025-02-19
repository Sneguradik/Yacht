import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { IApiTokens } from '@app/interfaces/api-tokens.interface';
import { LoginService } from '@app/services/login.service';
import { IAuthError } from '@api/interfaces/auth-error.interface';
import { WRONG_SUBJECT_ERROR, WRONG_PASSWORD_ERROR, WRONG_CREDENTIALS_ERROR, USERNAME_TAKEN, EMAIL_TAKEN } from '@api/constants/errors.const';
import { UsersService } from '@api/routes/users.service';
import { SocialLoginService } from '@layout/shared/services/social-login/social-login.service';
import { UserDropdownService } from '@layout/shared/services/user-dropdown.service';
import { LOGIN_FORM } from './login-form.const';
import { IUserView } from '@api/schemas/user/user-view.interface';
import { RegisterModeEnum } from './register-mode.enum';
import { FormGroup } from '@angular/forms';
import { of } from 'rxjs';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { switchMap, filter, tap, catchError, takeUntil } from 'rxjs/operators';
import { AuthHandlerService } from '@app/services/auth-handler.service';


@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent extends AbstractComponent implements OnDestroy {
  public readonly registerModeEnum: typeof RegisterModeEnum = RegisterModeEnum;
  public readonly loginForm: FormGroup = LOGIN_FORM.loginForm;
  public readonly recoveryForm: FormGroup = LOGIN_FORM.recoveryForm;
  public readonly registerForm: FormGroup = LOGIN_FORM.registerForm;

  public recovered = false;
  public recError = false;
  public registerMode: RegisterModeEnum = RegisterModeEnum.LOGIN;

  constructor(
    private readonly loginService: LoginService,
    private readonly authService: AuthHandlerService,
    private readonly usersService: UsersService,
    private readonly userDropdownService: UserDropdownService,
    private readonly router: Router,
    public readonly socialLoginService: SocialLoginService
  ) {
    super();
  }

  public onSubmitLogin(): void {
    const value = this.loginForm.value;
    this.authService.login$(value.subject, value.password).pipe(
      switchMap((tokens: IApiTokens) => this.loginService.login$(tokens)),
      filter((_: IUserView) => !!_),
      tap(() => this.router.navigate(['/all'])),
      catchError((error: IAuthError) => {
        switch (error.cause) {
          case WRONG_SUBJECT_ERROR:
            this.loginForm.controls.subject.setErrors({ wrongSubject: true });
            break;
          case WRONG_PASSWORD_ERROR:
            this.loginForm.controls.password.setErrors({ wrongPassword: true });
            break;
          case WRONG_CREDENTIALS_ERROR:
            this.loginForm.controls.password.setErrors({ wrongCredentials: true });
            break;
          default:
            this.loginForm.setErrors({ backend: true });
            break;
        }
        return of(null);
      }),
      takeUntil(this.ngOnDestroy$)
    ).subscribe();
  }

  public onSubmitRecovery(): void {
    const value = this.recoveryForm.value;
    this.usersService.resetInit$(value.email).pipe(
      tap(() => {
        this.recovered = true;
        this.recError = false;
      }),
      catchError(() => {
        this.recError = true;
        return of(null);
      }),
      takeUntil(this.ngOnDestroy$)
    ).subscribe();
  }

  public onSubmitRegister(): void {
    const value = this.registerForm.value;
    const names = value.name.match(/^(\S+) (\S+)/);
    this.usersService.register$(names[1], names[2], value.email, value.password, value.username).pipe(
      switchMap((tokens: IApiTokens) => this.loginService.login$(tokens)),
      filter((_: IUserView) => !!_),
      tap(() => this.router.navigate(['/all'])),
      catchError((error: IAuthError) => {
        switch (error.cause) {
          case USERNAME_TAKEN:
            this.registerForm.controls.username.setErrors({ taken: true });
            break;
          case EMAIL_TAKEN:
            this.registerForm.controls.email.setErrors({ taken: true });
            break;
          default:
            if (error.error && error.error.status === 409) {
              this.registerForm.controls.email.setErrors({ taken: true });
              this.registerForm.controls.username.setErrors({ taken: true });
            }
            break;
        }
        return of(null);
      }),
      takeUntil(this.ngOnDestroy$)
    ).subscribe();
  }

  public toggleUserMenu(): void {
    this.userDropdownService.setShowDropdown(false);
  }

  public setRegisterMode(mode: RegisterModeEnum): void {
    this.registerMode = mode;
  }
}

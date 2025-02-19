import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoginService } from '@app/services/login.service';
import { takeUntil, switchMap } from 'rxjs/operators';
import { AuthService } from '@api/routes/auth.service';
import { WRONG_SUBJECT_ERROR, WRONG_PASSWORD_ERROR } from '@api/constants/errors.const';
import { IAuthError } from '@api/interfaces/auth-error.interface';
import { FormBuilder } from '@angular/forms';
import { SocialLoginService } from '@layout/shared/services/social-login/social-login.service';
import { LoginSocialConnectService } from '@layout/shared/services/login-social-connect.service';
import { IApiTokens } from '@app/interfaces/api-tokens.interface';
import { IUserView } from '@api/schemas/user/user-view.interface';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-social-connect',
  templateUrl: './login-social-connect.component.html',
  styleUrls: ['./login-social-connect.component.scss']
})
export class LoginSocialConnectComponent extends AbstractComponent implements OnInit, OnDestroy {
  public readonly loginForm = this.fb.group({
    subject: this.fb.control(''),
    password: this.fb.control(''),
    remember: this.fb.control(''),
  });

  public shown = false;
  public showConnect = false;

  constructor(
    private readonly socialLoginService: SocialLoginService,
    private readonly loginSocialConnectService: LoginSocialConnectService,
    private readonly authService: AuthService,
    private readonly loginService: LoginService,
    private readonly fb: FormBuilder,
    private readonly router: Router
  ) { super(); }

  ngOnInit(): void {
    this.loginSocialConnectService.component = this;
  }

  public cancel(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.shown = false;
    }
  }

  public onSubmitLogin(): void {
    const value = this.loginForm.value;
    this.authService
      .login$(value.subject, value.password)
      .pipe(
        switchMap((tokens: IApiTokens) => this.loginService.login$(tokens)),
        switchMap(() => this.loginSocialConnectService.connect$()),
        takeUntil(this.ngOnDestroy$)
      )
      .subscribe(
        () => {
          this.shown = false;
          this.router.navigate(['/all']);
        },
        (error: IAuthError) => {
          switch (error.cause) {
            case WRONG_SUBJECT_ERROR:
              this.loginForm.controls.subject.setErrors({ wrongSubject: true });
              break;
            case WRONG_PASSWORD_ERROR:
              this.loginForm.controls.password.setErrors({ wrongPassword: true });
              break;
            default:
              this.loginForm.setErrors({ backend: true });
              break;
          }
        },
      );
  }

  public connectGoogle(): void {
    this.socialLoginService
      .getGoogle$()
      .pipe(
        switchMap((body: any) => this.loginSocialConnectService.login$('google', body)),
        switchMap(() => this.loginSocialConnectService.connect$()),
        takeUntil(this.ngOnDestroy$)
      )
      .subscribe(() => { this.shown = false; this.router.navigate(['/all']); });
  }

  public connectFacebook(): void {
    this.socialLoginService
      .getFacebook$()
      .pipe(
        switchMap((body: any) => this.loginSocialConnectService.login$('facebook', body)),
        switchMap(() => this.loginSocialConnectService.connect$()),
        takeUntil(this.ngOnDestroy$)
      )
      .subscribe(() => { this.shown = false; this.router.navigate(['/all']); });
  }

  public connectVk(): void {
    this.socialLoginService
      .getVk$()
      .pipe(
        switchMap((body: any) => this.loginSocialConnectService.login$('vk', body)),
        switchMap(() => this.loginSocialConnectService.connect$()),
        takeUntil(this.ngOnDestroy$)
      )
      .subscribe(() => { this.shown = false; this.router.navigate(['/all']); });
  }

  public connectTg(): void {
    this.socialLoginService
      .getTg$()
      .pipe(
        switchMap((body: any) => this.loginSocialConnectService.login$('tg', body)),
        switchMap(() => this.loginSocialConnectService.connect$()),
        takeUntil(this.ngOnDestroy$)
      )
      .subscribe(() => { this.shown = false; this.router.navigate(['/all']); });
  }

  public register(): void {
    this.loginSocialConnectService.register$().pipe(takeUntil(this.ngOnDestroy$)).subscribe((_: IUserView) => {
      this.shown = false;
      this.router.navigate(['/all']);
    });
  }
}

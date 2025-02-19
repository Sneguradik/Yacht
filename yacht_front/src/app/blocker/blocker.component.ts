import { Component } from '@angular/core';
import { AuthService } from '@api/routes/auth.service';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { switchMap, filter, tap, takeUntil, catchError } from 'rxjs/operators';
import { IApiTokens } from '@app/interfaces/api-tokens.interface';
import { LoginService } from '@app/services/login.service';
import { IUserView } from '@api/schemas/user/user-view.interface';
import { Router } from '@angular/router';
import { of } from 'rxjs';

@Component({
  selector: 'app-blocker',
  templateUrl: './blocker.component.html',
  styleUrls: ['./blocker.component.scss']
})
export class BlockerComponent extends AbstractComponent {
  public username = '';
  public password = '';
  public error = false;

  constructor(
    private readonly authService: AuthService,
    private readonly loginService: LoginService,
    private readonly router: Router
  ) { super(); }

  public submit(event: any): void {
    if (event.keyCode === 13) {
      this.authService.login$(this.username, this.password).pipe(
        switchMap((tokens: IApiTokens) => this.loginService.login$(tokens)),
        filter((user: IUserView) => !!user),
        tap(() => this.router.navigate(['/all'])),
        catchError(() => {
          this.error = true;
          return of(null);
        }),
        takeUntil(this.ngOnDestroy$)
      ).subscribe();
    }
  }
}

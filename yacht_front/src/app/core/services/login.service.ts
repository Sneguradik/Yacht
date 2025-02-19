import { Injectable } from '@angular/core';
import { SessionService } from '@app/services/session.service';
import { TokenService } from '@app/services/token.service';
import { Observable } from 'rxjs';
import { IApiTokens } from '@app/interfaces/api-tokens.interface';
import { IUserView } from '@api/schemas/user/user-view.interface';
import { skip, first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  constructor(private readonly session: SessionService, private readonly tokens: TokenService) {}

  public login$(tokens: IApiTokens): Observable<IUserView> {
    this.tokens.save(tokens);
    return this.session.user$.pipe(skip(1), first());
  }
}

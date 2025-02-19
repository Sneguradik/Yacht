import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@api/services/api.service';

@Injectable({
  providedIn: 'root',
})
export class RecoverPasswordService {
  constructor(private readonly api: ApiService) {}

  public init$(email: string): Observable<never> {
    return this.api.post$('users/reset', { email }, true);
  }

  public check$(hash: string, email: string): Observable<never> {
    return this.api.get$(`users/reset?hash=${hash}&email=${email}`, true);
  }

  public change$(hash: string, email: string, password: string): Observable<never> {
    return this.api.post$('users/reset/change', { email, password, hash }, true);
  }
}

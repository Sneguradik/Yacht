import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';
import { map } from 'rxjs/operators';
import { IApiTokens } from '@app/interfaces/api-tokens.interface';

const CONTROLLER_ENDPOINT = 'auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private readonly http: HttpClient) { }

  public exists$(method: string, body: any): Observable<boolean> {
    return this.http.post<{ exists: boolean }>(`${ environment.apiUrl + CONTROLLER_ENDPOINT }/check/${ method }`, body)
      .pipe(map((_: { exists: boolean }) => _.exists));
  }

  public loginSocial$(method?: string, body?: any): Observable<IApiTokens> {
    return this.http.post<IApiTokens>(`${ environment.apiUrl + CONTROLLER_ENDPOINT }/social/${ method }`, body);
  }

  public login$(subject: string, password: string): Observable<IApiTokens> {
    return this.http.post<IApiTokens>(`${ environment.apiUrl + CONTROLLER_ENDPOINT }/classic`, { subject, password });
  }
}

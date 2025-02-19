import { Injectable } from '@angular/core';
import { environment } from '@env';
import { IApiTokens } from '@app/interfaces/api-tokens.interface';
import { Stomp, CompatClient, IMessage } from '@stomp/stompjs';
import { BehaviorSubject } from 'rxjs';
import { TokenService } from '@app/services/token.service';
import { HttpClient } from '@angular/common/http';
import { NotificationsService } from '@api/routes/notifications.service';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { INotification } from '@api/schemas/notification/notification.interface';
import { PlatformService } from './platform.service';


interface ISocketHeader {
  Authorization: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationUpdateService {
  private client: CompatClient = null;

  public readonly unreadNotifications$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public readonly notifications$: BehaviorSubject<INotification[]> = new BehaviorSubject<INotification[]>([]);

  public lastToken = '';

  constructor(
    private readonly token: TokenService,
    private readonly http: HttpClient,
    private readonly notificationsService: NotificationsService,
    private readonly platformService: PlatformService
  ) {
    this.client = Stomp.client(`wss://${ environment.baseApiUrl }/ws`);
  }

  public subOnNotifications(userId: number): void {
    this.update();
    this.client.onWebSocketClose = () => {
      setTimeout(() => {
        this.connect(userId);
      }, 1000);
    };
    this.connect(userId);
  }

  private connect(userId: number): void {
    if (this.token.access && this.token.refresh && this.platformService.isBrowser) {
      let header: ISocketHeader = { Authorization: `Bearer ${this.token.access}` };
      this.lastToken = this.token.access;
      this.client.connect(
        header,
        () => {
          this.client.subscribe(
            `/user/${ userId }/queue/reply`,
            (_: IMessage) => {
              this.notificationsService.unreadCount$().subscribe((count: number) => {
                this.unreadNotifications$.next(count);
              });
              const temp: INotification[] = this.notifications$.value;
              temp.unshift(JSON.parse(_.body));
              this.notifications$.next(temp);
            },
            header as any,
          );
        },
        () => {
          this.http
            .post(`${ environment.apiUrl }token/refresh`, {
              refreshToken: this.token.refresh,
            })
            .subscribe({
              error: () => {
                this.token.clear();
              },
              next: (tokens: IApiTokens) => {
                this.token.save(tokens);
                header = { Authorization: `Bearer ${ this.token.access }` };
                this.lastToken = this.token.access;
                this.connect(userId);
              },
            });
        },
      );
    }
  }

  public disconnect(): void {
    this.client.disconnect(() => {}, { Authorization: `Bearer ${ this.lastToken }` });
    this.clear();
  }

  public update(): void {
    this.notificationsService.get$(0).subscribe((_: IPageResponse<INotification>) => {
      this.notifications$.next(_.content);
    });
    this.updateCount();
  }

  public updateCount(): void {
    this.notificationsService.unreadCount$().subscribe((_: number) => {
      this.unreadNotifications$.next(_);
    });
  }

  public add(items: INotification[]): void {
    const temp: INotification[] = this.notifications$.value;
    temp.push(...items);
    this.notifications$.next(temp);
  }

  public clear(): void {
    this.notifications$.next([]);
    this.unreadNotifications$.next(0);
  }
}

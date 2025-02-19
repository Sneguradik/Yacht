import { Injectable } from '@angular/core';
import { ApiService } from '@api/services/api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { INotificationOrigin } from '@api/schemas/notification/notification-origin.interface';
import { INotification } from '@api/schemas/notification/notification.interface';
import { INotSetting } from '@api/schemas/notification/not-setting.interface';

const CONTROLLER_ENDPOINT = 'notifications';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  constructor(private readonly api: ApiService) {}

  public unreadCount$(): Observable<number> {
    return this.api.get$<{ count: number }>(`${ CONTROLLER_ENDPOINT }/count`).pipe(map((_: { count: number }) => _.count));
  }

  public markRead$(id: number): Observable<never> {
    return this.api.post$(`${ CONTROLLER_ENDPOINT }/${ id }/read`);
  }

  public postSettings$(body: INotSetting[]): Observable<never> {
    return this.api.post$(`${ CONTROLLER_ENDPOINT }/settings`, body);
  }

  public getSettings$(): Observable<INotSetting[]> {
    return this.api.get$<INotSetting[]>(`${ CONTROLLER_ENDPOINT }/settings`);
  }

  public get$(page: number, order?: string): Observable<IPageResponse<INotification>> {
    return this.api.get$<IPageResponse<INotificationOrigin>>(
      CONTROLLER_ENDPOINT, false, { page: page.toString(), order }
    ).pipe(
      map((_: IPageResponse<INotificationOrigin>) => {
        const ret: IPageResponse<INotification> = {
          content: [],
          page: _.page,
          total: _.total,
          totalPages: _.totalPages,
        };
        _.content.forEach((e: INotificationOrigin) => {
          if (e.type === 'content_report') {
            ret.content.push({
              ...e,
              body: {
                ...JSON.parse(e.body.replace(/"message".*"owner"/g, '"owner"')),
                message: e.body
                  .match(/"message".*"owner"/g)[0]
                  .replace('"message":"', '')
                  .replace('","owner"', ''),
              },
              read: e.read,
            });
          } else {
            ret.content.push({ ...e, body: JSON.parse(e.body), read: e.read });
          }
        });
        return ret;
      }),
    );
  }
}

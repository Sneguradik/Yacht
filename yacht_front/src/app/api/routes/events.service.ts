import { Injectable } from '@angular/core';
import { BaseStatus } from '@api/classes/base-status/base-status.class';
import { ApiService } from '@api/services/api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { IEventView } from '@api/schemas/event/event-view.interface';
import { IEventQuery } from '@api/schemas/event/event-query.interface';
import { IEventPatch } from '@api/schemas/event/patch.interface';
import { BaseStatusActionEnum } from '@api/classes/base-status/base-status-action.enum';
import { IEventViewFull } from '@api/schemas/event/event-view-full.interface';
import { Store } from '@ngxs/store';

const CONTROLLER_ENDPOINT = 'events';

@Injectable({
  providedIn: 'root',
})
export class EventsService extends BaseStatus {
  constructor(
    protected readonly apiService: ApiService,
    protected readonly store: Store
  ) {
    super(apiService, CONTROLLER_ENDPOINT, store);
  }

  public get$(page: number = 0, query: IEventQuery = {}): Observable<IPageResponse<IEventView>> {
    return this.apiService.get$<IPageResponse<IEventView>>(CONTROLLER_ENDPOINT, true, { ...query, page });
  }

  public count$(query: Omit<IEventQuery, 'page'> = {}): Observable<{ count: number }> {
    return this.apiService.get$<{ count: number }>(CONTROLLER_ENDPOINT, true, query);
  }

  public getSingle$(id: number): Observable<IEventViewFull> {
    return this.apiService.get$<IEventViewFull>(`${ CONTROLLER_ENDPOINT }/${ id }`, true);
  }

  public getBookmarked$(userId: number, page: number): Observable<IPageResponse<IEventView>> {
    return this.apiService.get$<IPageResponse<IEventView>>(`${ CONTROLLER_ENDPOINT }/${ userId }/bookmarks`, false, { page });
  }

  public create$(): Observable<number> {
    return this.apiService.post$<{ id: number }>(CONTROLLER_ENDPOINT).pipe(map((_: { id: number }) => _.id));
  }

  public patch$(id: number, patch: IEventPatch): Observable<IEventViewFull> {
    return this.apiService.patch$<IEventViewFull>(`${ CONTROLLER_ENDPOINT }/${ id }`, patch);
  }

  public setSource$(id: number, source: string): Observable<{ html: string }> {
    return this.apiService.put$<{ html: string }>(`${ CONTROLLER_ENDPOINT }/${ id }/source`, { source });
  }

  public getSource$(id: number): Observable<{ source: string }> {
    return this.apiService.get$<{ source: string }>(`${ CONTROLLER_ENDPOINT }/${ id }/source`);
  }

  public delete$(id: number): Observable<never> {
    return this.apiService.delete$(`${ CONTROLLER_ENDPOINT }/${ id }`);
  }

  public submit$(id: number): Observable<never> {
    return this.toggleStatus$(id, BaseStatusActionEnum.SUBMIT);
  }

  public publish$(id: number): Observable<never> {
    return this.toggleStatus$(id, BaseStatusActionEnum.PUBLISH);
  }

  public withdraw$(id: number): Observable<never> {
    return this.toggleStatus$(id, BaseStatusActionEnum.PUBLISH, true);
  }
}

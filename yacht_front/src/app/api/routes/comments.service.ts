import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { ApiService } from '@api/services/api.service';
import { BaseStatus } from '@api/classes/base-status/base-status.class';
import { BaseStatusActionEnum } from '@api/classes/base-status/base-status-action.enum';
import { ICommentViewFeed } from '@api/schemas/comment/comment-view-feed.interface';
import { Store } from '@ngxs/store';

const CONTROLLER_ENDPOINT = 'comments';

@Injectable({
  providedIn: 'root',
})
export class CommentsService extends BaseStatus {
  constructor(
    private readonly api: ApiService,
    protected readonly store: Store
  ) {
    super(api, CONTROLLER_ENDPOINT, store);
  }

  public delete$(id: number): Observable<never> {
    return this.api.delete$(`${ CONTROLLER_ENDPOINT }/${ id }`);
  }

  public getSource$(id: number): Observable<{ source: string }> {
    return this.api.get$<{ source: string }>(`${ CONTROLLER_ENDPOINT }/${ id }/source`);
  }

  public getById$(id: number): Observable<ICommentViewFeed> {
    return this.api.get$<ICommentViewFeed>(`${ CONTROLLER_ENDPOINT }/${ id }`);
  }

  public setSource$(id: number, source: string): Observable<{ html: string }> {
    return this.api.put$<{ html: string }>(`${ CONTROLLER_ENDPOINT }/${ id }/source`, { source });
  }

  public watch$(id: number, watch: boolean): Observable<never> {
    return this.toggleStatus$(id, BaseStatusActionEnum.WATCH, !watch);
  }
}

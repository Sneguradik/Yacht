import { Injectable } from '@angular/core';
import { BaseStatus } from '@api/classes/base-status/base-status.class';
import { ApiService } from '@api/services/api.service';
import { ITagQuery } from '@api/schemas/tags/tag-query.interface';
import { Observable, of } from 'rxjs';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { ITagView } from '@api/schemas/tags/tag-view.interface';
import { CachedGetMany } from '@api/classes/cached-get-many.class';
import { map, catchError } from 'rxjs/operators';
import { PlatformService } from '@shared/services/platform.service';
import { Store } from '@ngxs/store';

const CONTROLLER_ENDPOINT = 'tags';

@Injectable({
  providedIn: 'root'
})
export class TagsService extends BaseStatus {
  private readonly manyCache: CachedGetMany<ITagView> =
    new CachedGetMany<ITagView>(this.apiService, CONTROLLER_ENDPOINT, this.platformService);

  constructor(
    protected readonly apiService: ApiService,
    protected readonly store: Store,
    private readonly platformService: PlatformService
  ) {
    super(apiService, CONTROLLER_ENDPOINT, store);
  }

  public get$(page: number = 0, query: ITagQuery = {}): Observable<IPageResponse<ITagView>> {
    return this.apiService.get$<IPageResponse<ITagView>>(CONTROLLER_ENDPOINT, true, { ...query, page });
  }

  public getSingle$(id: number): Observable<ITagView> {
    return this.apiService.get$<ITagView>(`${ CONTROLLER_ENDPOINT }/${ id }`, true);
  }

  public create$(content: string): Observable<number> {
    return this.apiService.post$<{ id: number }>(`${ CONTROLLER_ENDPOINT }`,
      { content: content.toLowerCase().replace(/\s+/g, '') }).pipe(map((_: { id: number }) => _.id));
  }

  public markAsViewed$(id: number): Observable<never> {
    return this.apiService.post$<never>(`${ CONTROLLER_ENDPOINT }/${ id }/view`, false);
  }

  public delete$(id: number): Observable<never> {
    return this.apiService.delete$<never>(`${ CONTROLLER_ENDPOINT }/${ id }`);
  }

  public find$(content: string): Observable<number | null> {
    return this.apiService.get$<{ id: any }>(`${ CONTROLLER_ENDPOINT }?id&content=${ encodeURIComponent(content.toLowerCase().replace(/\s+/g, '')) }`).pipe(
      map((_: { id: any }) => _.id),
      catchError((err: any) => {
        if (err.status === 404) {
          return of(null);
        }
        throw err;
      }),
    );
  }

  public getMultiple$(ids: number[]): Observable<ITagView[]> {
    return this.manyCache.get$(ids);
  }
}

import { Injectable } from '@angular/core';
import { ApiService } from '@api/services/api.service';
import { Observable } from 'rxjs';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { map } from 'rxjs/operators';
import { IUploadImageResponse } from '@api/schemas/image/upload-image-response.interface';
import { BaseStatus } from '@api/classes/base-status/base-status.class';
import { ITopicViewFull } from '@api/schemas/topic/topic-view-full.interface';
import { ITopicViewBase } from '@api/schemas/topic/topic-view-base.interface';
import { ITopicView } from '@api/schemas/topic/topic-view.interface';
import { ITopicQuery } from '@api/schemas/topic/topic-query.interface';
import { CachedGetMany } from '@api/classes/cached-get-many.class';
import { fileToFormData } from '@api/functions/file-to-formdata.function';
import { PlatformService } from '@shared/services/platform.service';
import { Store } from '@ngxs/store';

const CONTROLLER_ENDPOINT = 'topics';

@Injectable({
  providedIn: 'root'
})
export class TopicsService extends BaseStatus {
  private readonly manyCache: CachedGetMany<ITopicViewFull> =
    new CachedGetMany<ITopicViewFull>(this.apiService, CONTROLLER_ENDPOINT, this.platformService);

  constructor(
    protected readonly apiService: ApiService,
    protected readonly store: Store,
    private readonly platformService: PlatformService
  ) {
    super(apiService, CONTROLLER_ENDPOINT, store);
  }

  private uploadImage$(image: File, url: string): Observable<IUploadImageResponse> {
    return this.apiService.put$<IUploadImageResponse>(url, fileToFormData(image));
  }

  public getOne$(id: number | string): Observable<ITopicViewFull> {
    return this.apiService.get$<ITopicViewFull>(
      `${ CONTROLLER_ENDPOINT }/${ !isNaN(parseInt(id as string, 10)) ? id : 'url/' + id }`, true);
  }

  public search$(query: string, page: number = 0): Observable<IPageResponse<ITopicViewBase>> {
    return this.apiService.get$<IPageResponse<ITopicViewBase>>(`${ CONTROLLER_ENDPOINT }?page=${ page }&query=${ encodeURIComponent(query) }`, true);
  }

  public get$(page: number = 0, query: ITopicQuery = {}): Observable<IPageResponse<ITopicView>> {
    return this.apiService.get$<IPageResponse<ITopicView>>(CONTROLLER_ENDPOINT, true, { ...query, page });
  }

  public getCount(): Observable<number> {
    return this.apiService.get$<IPageResponse<ITopicView>>(`${ CONTROLLER_ENDPOINT }?page=0`, true)
      .pipe(map((response: IPageResponse<ITopicView>) => response.total));
  }

  public create$(name: string): Observable<ITopicView> {
    return this.apiService.post$<ITopicView>(CONTROLLER_ENDPOINT, { name });
  }

  public post$(body: { name: string; url: string }): Observable<number> {
    return this.apiService.post$<{ id: number }>(CONTROLLER_ENDPOINT, body).pipe(map((_: { id: number }) => _.id));
  }

  public delete$(id: number): Observable<never> {
    return this.apiService.delete$<never>(`${ CONTROLLER_ENDPOINT }/${ id }`);
  }

  public deleteAdvanced$(id: number, tags: string, topic: number): Observable<never> {
    return this.apiService.delete$(
      tags
        ? `${ CONTROLLER_ENDPOINT }/${ id }/advanced?id=${ id }&tags=${ tags }&topic=${ topic }`
        : `${ CONTROLLER_ENDPOINT }/${ id }/advanced?id=${ id }&topic=${ topic }`
      );
  }

  public update$(id: number, update: any): Observable<never> {
    return this.apiService.patch$<never>(`${ CONTROLLER_ENDPOINT }/${ id }`, update, false);
  }

  public updateAvatar$(id: number, file: File): Observable<IUploadImageResponse> {
    return this.uploadImage$(file, `${ CONTROLLER_ENDPOINT }/${ id }/image`);
  }

  public updateCover$(id: number, file: File): Observable<IUploadImageResponse> {
    return this.uploadImage$(file, `${ CONTROLLER_ENDPOINT }/${ id }/cover`);
  }

  public getMultiple$(ids: number[]): Observable<ITopicViewFull[]> {
    return this.manyCache.get$(ids);
  }
}

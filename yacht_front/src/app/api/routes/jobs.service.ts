import { Injectable } from '@angular/core';
import { BaseStatus } from '@api/classes/base-status/base-status.class';
import { IUploadImageResponse } from '@api/schemas/image/upload-image-response.interface';
import { IJobQuery } from '@api/schemas/job/job-query.interface';
import { IJobViewFull } from '@api/schemas/job/job-view-full.interface';
import { IJobView } from '@api/schemas/job/job-view.interface';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { ApiService } from '@api/services/api.service';
import qs from 'qs';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { fileToFormData } from '@api/functions/file-to-formdata.function';
import { BaseStatusActionEnum } from '@api/classes/base-status/base-status-action.enum';
import { IJobPatch } from '@api/schemas/job/job-patch.inetrface';
import { Store } from '@ngxs/store';


const CONTROLLER_ENDPOINT = 'jobs';

@Injectable({
  providedIn: 'root',
})
export class JobsService extends BaseStatus {
  constructor(
    private readonly api: ApiService,
    protected readonly store: Store
  ) {
    super(api, CONTROLLER_ENDPOINT, store);
  }

  public get$(page: number = 0, query: IJobQuery = {}): Observable<IPageResponse<IJobView>> {
    return this.api.get$<IPageResponse<IJobView>>(`${ CONTROLLER_ENDPOINT }?${ qs.stringify({ ...query, page }) }`, true);
  }

  public count$(query: Omit<IJobQuery, 'page'> = {}): Observable<{ count: number }> {
    return this.api.get$<{ count: number }>(`${ CONTROLLER_ENDPOINT }/count?${ qs.stringify(query) }`, true);
  }

  public getSingle$(id: number): Observable<IJobViewFull> {
    return this.api.get$<IJobViewFull>(`${ CONTROLLER_ENDPOINT }/${ id }`, true);
  }

  public getBookmarked$(userId: number, page: number): Observable<IPageResponse<IJobView>> {
    return this.apiService.get$<IPageResponse<IJobView>>(`${ CONTROLLER_ENDPOINT }/${ userId }/bookmarks`, false, { page });
  }

  public create$(): Observable<number> {
    return this.api.post$<{ id: number }>(CONTROLLER_ENDPOINT).pipe(map((_: { id: number }) => _.id));
  }

  public patch$(id: number, patch: IJobPatch): Observable<IJobViewFull> {
    return this.api.patch$<IJobViewFull>(`${ CONTROLLER_ENDPOINT }/${ id }`, patch);
  }

  public updateImage$(id: number, image: File): Observable<IUploadImageResponse> {
    return this.api.put$<IUploadImageResponse>(`${ CONTROLLER_ENDPOINT }/${ id }/image`, fileToFormData(image));
  }

  public delete$(id: number): Observable<never> {
    return this.api.delete$(`${ CONTROLLER_ENDPOINT }/${ id }`);
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

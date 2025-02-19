import { Injectable } from '@angular/core';
import { ApiService } from '@api/services/api.service';
import { BaseStatus } from '@api/classes/base-status/base-status.class';
import { IUserQuery } from '@api/schemas/user/user-query.interface';
import { Observable } from 'rxjs';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { ICommentViewFeed } from '@api/schemas/comment/comment-view-feed.interface';
import { IUserView } from '@api/schemas/user/user-view.interface';
import { map } from 'rxjs/operators';
import { ICompanyView } from '@api/schemas/company/company-view.interface';
import { ICompanyViewFull } from '@api/schemas/company/company-view-full.interface';
import { IJobQuery } from '@api/schemas/job/job-query.interface';
import { IEventQuery } from '@api/schemas/event/event-query.interface';
import { IEventView } from '@api/schemas/event/event-view.interface';
import { IJobView } from '@api/schemas/job/job-view.interface';
import { Store } from '@ngxs/store';

const CONTROLLER_ENDPOINT = 'companies';

@Injectable({
  providedIn: 'root'
})
export class CompaniesService extends BaseStatus {
  constructor(
    protected readonly apiService: ApiService,
    protected readonly store: Store
  ) {
    super(apiService, CONTROLLER_ENDPOINT, store);
  }

  public get$(page: number = 0, query: IUserQuery = {}): Observable<IPageResponse<ICompanyView>> {
    return this.apiService.get$<IPageResponse<ICompanyView>>(CONTROLLER_ENDPOINT, true, { ...query, company: true, page });
  }

  public getSingle$(id: number): Observable<ICompanyViewFull> {
    return this.apiService.get$<ICompanyViewFull>(`${ CONTROLLER_ENDPOINT }/${ id }`, true);
  }

  public createCompany$(): Observable<never> {
    return this.apiService.post$<never>(CONTROLLER_ENDPOINT, false);
  }

  public delete$(id: number): Observable<never> {
    return this.apiService.delete$<never>(`${ CONTROLLER_ENDPOINT }/${ id }`);
  }

  public comments$(page: number = 0, id: number): Observable<IPageResponse<ICommentViewFeed>> {
    return this.apiService.get$<IPageResponse<ICommentViewFeed>>(`${ CONTROLLER_ENDPOINT }/${ id }/comments?page=${ page }`, true);
  }

  public events$(id: number, page: number = 0, query: IEventQuery): Observable<IPageResponse<IEventView>> {
    return this.apiService.get$<IPageResponse<IEventView>>(`${ CONTROLLER_ENDPOINT }/${ id }/events`, true, { ...query, page });
  }

  public jobs$(id: number, page: number = 0, query: IJobQuery): Observable<IPageResponse<IJobView>> {
    return this.apiService.get$<IPageResponse<IJobView>>(`${ CONTROLLER_ENDPOINT }/${ id }/jobs`, true, { ...query, page });
  }

  public members$(id: number, page: number = 0): Observable<IPageResponse<IUserView>> {
    return this.apiService.get$<IPageResponse<IUserView>>(`${ CONTROLLER_ENDPOINT }/${ id }/members?page=${ page }`, true);
  }

  public toggleMember$(companyId: number, userId: number, remove?: boolean): Observable<never> {
    return remove
      ? this.apiService.delete$<never>(`${ CONTROLLER_ENDPOINT }/${ companyId }/members/${ userId }`)
      : this.apiService.post$<never>(`${ CONTROLLER_ENDPOINT }/${ companyId }/members/${ userId }`);
  }

  public jobCount$(id: number, query: IJobQuery = {}): Observable<number> {
    return this.apiService.get$<{ count: number }>(`${ CONTROLLER_ENDPOINT }/${ id }/jobs/count`, true, query)
      .pipe(map((_: { count: number }) => _.count));
  }

  public jobCountNew$(id: number, query: IJobQuery = {}): Observable<number> {
    return this.apiService.get$<{ jobCount: number }>(`${ CONTROLLER_ENDPOINT }/${ id }`, true, query)
      .pipe(map((_: { jobCount: number }) => _.jobCount));
  }

  public eventCount$(id: number, query: IEventQuery = {}): Observable<number> {
    return this.apiService.get$<{ count: number }>(`${ CONTROLLER_ENDPOINT }/${ id }/events/count`, true, query)
      .pipe(map((_: { count: number }) => _.count));
  }
}

import { Injectable } from '@angular/core';
import { ApiService } from '@api/services/api.service';
import { IActivityView } from '@api/schemas/dashboard/activity-view.interface';
import { Observable } from 'rxjs';
import { IEventsJobsControl } from '@api/schemas/dashboard/events-jobs-control.interface';
import { IRatingData } from '@api/schemas/dashboard/ratings-data.interface';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { IUserWithRoleShort } from '@api/schemas/dashboard/user-with-role-short.interface';
import { map } from 'rxjs/operators';
import { IUserView } from '@api/schemas/user/user-view.interface';
import { ITagDashboardView } from '@api/schemas/dashboard/tag-dashboard-view.interface';
import { ITagsStatistic } from '@api/schemas/dashboard/tags-statistics.interface';
import { IUploadImageResponse } from '@api/schemas/image/upload-image-response.interface';
import { fileToFormData } from '@api/functions/file-to-formdata.function';
import { IPreviewManagementUpdate } from '@api/schemas/dashboard/preview-management-update.interface';
import { IPreviewManagementView } from '@api/schemas/dashboard/preview-management-view.interface';

const CONTROLLER_ENDPOINT = 'administration';

@Injectable({
  providedIn: 'root'
})
export class AdministrationService {
  constructor(private readonly api: ApiService) { }

  public getActivity$(before?: number, after?: number): Observable<IActivityView> {
    return this.api.get$<IActivityView>(`${ CONTROLLER_ENDPOINT }/users/stats${ before ? '?before=' + before + (after ? '&after=' + after : '') : after ? '?after=' + after : '' }`);
  }

  public getEventsJobs$(): Observable<IEventsJobsControl> {
    return this.api.get$<IEventsJobsControl>(`${ CONTROLLER_ENDPOINT }/events`, true);
  }

  public postEventsJobs$(body: IEventsJobsControl): Observable<never> {
    return this.api.post$(`${ CONTROLLER_ENDPOINT }/events`, body);
  }

  public getRatings$(): Observable<IRatingData> {
    return this.api.get$<IRatingData>(`${ CONTROLLER_ENDPOINT }/ranking`);
  }

  public postRatings$(body: IRatingData): Observable<never> {
    return this.api.post$(`${ CONTROLLER_ENDPOINT }/ranking`, body);
  }

  public getTags$(page: number = 0, query?: string): Observable<IPageResponse<ITagDashboardView>> {
    return this.api.get$<IPageResponse<ITagDashboardView>>(`${ CONTROLLER_ENDPOINT }/tags?page=${ page }${ query ? '&' + query : '' }`);
  }

  public getStats$(before?: number, after?: number): Observable<ITagsStatistic> {
    return this.api.get$<ITagsStatistic>(`${ CONTROLLER_ENDPOINT }/tags/stats${ before ? '?before=' + before + (after ? '&after=' + after : '') : after ? '?after=' + after : '' }`);
  }

  public putPreviewCover$(file: File): Observable<IUploadImageResponse> {
    return this.api.put$<IUploadImageResponse>(`${ CONTROLLER_ENDPOINT }/preview/url/default/cover`, fileToFormData(file));
  }

  public putPreviewContent$(body: IPreviewManagementUpdate): Observable<IPreviewManagementView> {
    return this.api.put$<IPreviewManagementView>(`${ CONTROLLER_ENDPOINT }/preview/url/default/content`, body);
  }

  public getPreview$(): Observable<IPreviewManagementView> {
    return this.api.get$<IPreviewManagementView>(`${ CONTROLLER_ENDPOINT }/preview/get/url/default`, true);
  }

  public getUsersByRoleWithQuery$(page: number, role: string, query?: string): Observable<IPageResponse<IUserWithRoleShort>> {
    return this.api.get$<IPageResponse<IUserWithRoleShort>>(`${ CONTROLLER_ENDPOINT }/users?role=${ role }&page=${ page }${ query ? '&' + query : '' }`).pipe(
      map((res: IPageResponse<IUserView> | any) => {
        const content: IUserWithRoleShort[] = [];
        res.content.forEach((element: any) => {
          content.push({
            id: element.meta.id,
            roles: element.roles,
            name: element.info.company.isCompany ? element.info.company.name : element.info.firstName + ' ' + element.info.lastName,
            icon: element.info.picture,
            rating: element.rating,
            publicationCount: element.postCount,
            subscribers: element.subscribers.count,
          });
        });

        return {
          page: res.page,
          total: res.total,
          totalPages: res.totalPages,
          content,
        };
      }),
    );
  }
}

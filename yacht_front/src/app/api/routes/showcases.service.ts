import { Injectable } from '@angular/core';
import { ApiService } from '@api/services/api.service';
import { ICreatedObject } from '@api/schemas/object/created-object.interface';
import { Observable, of } from 'rxjs';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { IShowcaseView } from '@api/schemas/showcase/showcase-view.interface';
import { fileToFormData } from '@api/functions/file-to-formdata.function';
import { IUploadImageResponse } from '@api/schemas/image/upload-image-response.interface';
import { IShowcasePatch } from '@api/schemas/showcase/showcase-patch.interface';
import { ShowcaseEditBlockService } from '@layout/sidebar-wrapper/live-content/showcase-edit-block.service';

const CONTROLLER_ENDPOINT = 'showcases';

@Injectable({
  providedIn: 'root'
})
export class ShowcasesService {
  constructor(private readonly apiService: ApiService, private readonly showcaseEBS: ShowcaseEditBlockService) {}

  public get$(page: number = 0, all?: boolean): Observable<IPageResponse<IShowcaseView>> {
    return this.apiService.get$<IPageResponse<IShowcaseView>>(CONTROLLER_ENDPOINT, !all, { page, all });
  }

  public getSingle$(id: number): Observable<IShowcaseView> {
    return this.apiService.get$<IShowcaseView>(`${ CONTROLLER_ENDPOINT }/${ id }`);
  }

  public storeView$(id: number): Observable<never> {
    return this.apiService.post$<never>(`${ CONTROLLER_ENDPOINT }/${ id }/view`);
  }

  public create$(): Observable<ICreatedObject> {
    return this.apiService.post$<ICreatedObject>(CONTROLLER_ENDPOINT);
  }

  // Management

  public updateCover$(id: number, image: File): Observable<IUploadImageResponse> {
    return this.apiService.put$<IUploadImageResponse>(`${ CONTROLLER_ENDPOINT }/${ id }/cover`, fileToFormData(image));
  }

  public patch$(id: number, patch: IShowcasePatch): Observable<IShowcaseView> {
    return this.apiService.patch$<IShowcaseView>(`${ CONTROLLER_ENDPOINT }/${ id }`, patch);
  }

  public delete$(id: number): Observable<never> {
    return this.apiService.delete$<never>(`${ CONTROLLER_ENDPOINT }/${ id }`);
  }

  public publish$(id: number): Observable<never> {
    return this.apiService.post$<never>(`${ CONTROLLER_ENDPOINT }/${ id }/publish`);
  }

  public withdraw$(id: number): Observable<never> {
    return this.apiService.delete$<never>(`${ CONTROLLER_ENDPOINT }/${ id }/publish`);
  }

  // -----------

  public navigate$(created: ICreatedObject): Observable<boolean> {
    this.showcaseEBS.setId(created.id);
    this.showcaseEBS.toggle();
    return of(true);
  }
}

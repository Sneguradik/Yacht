import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@api/services/api.service';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { BannerPlaceTypeEnum } from '@api/schemas/advertisement/banner-place-type.enum';
import { fileToFormData } from '@api/functions/file-to-formdata.function';
import { IBannerCreateView } from '@api/schemas/advertisement/banner-create-view.interface';
import { IBannerReturnView } from '@api/schemas/advertisement/banner-return-view.interface';
import { BannerPlaceEnum } from '@api/schemas/advertisement/banner-place.enum';

const CONTROLLER_ENDPOINT = 'advertisement';

@Injectable({
  providedIn: 'root',
})
export class AdvertisementService {
  constructor(private readonly api: ApiService) {}

  public get$(page: number = 0, place: BannerPlaceEnum): Observable<IPageResponse<IBannerReturnView>> {
    return this.api.get$<IPageResponse<IBannerReturnView>>(`${ CONTROLLER_ENDPOINT }/active?page=${ page }&place=${ place }&order=ROTATION_DESC`, true);
  }

  public click$(id: number): Observable<never> {
    return this.api.post$(`${ CONTROLLER_ENDPOINT }/click/${ id }`, null, true);
  }

  public view$(id: number): Observable<never> {
    return this.api.post$(`${ CONTROLLER_ENDPOINT }/view/${ id }`, null, true);
  }

  public getAll$(page: number, placeType?: BannerPlaceTypeEnum,
                 order?: string, query?: string): Observable<IPageResponse<IBannerReturnView>> {
    return query
      ? this.api.get$<IPageResponse<IBannerReturnView>>(`${ CONTROLLER_ENDPOINT }/all`,
        false, { page, placeType, order: order ? order : 'ID_DESC', query })
      : this.api.get$<IPageResponse<IBannerReturnView>>(`${ CONTROLLER_ENDPOINT }/all`,
        false, { page, placeType, order: order ? order : 'ID_DESC' });
  }

  public updateImage$(id: number, image: File): Observable<{ url: string }> {
    return this.api.put$<{ url: string }>(`${ CONTROLLER_ENDPOINT }/${ id }/picture`, fileToFormData(image));
  }

  public post$(body: IBannerCreateView): Observable<IBannerReturnView> {
    return this.api.post$<IBannerReturnView>(CONTROLLER_ENDPOINT, body);
  }

  public put$(id: number, body: IBannerCreateView): Observable<never> {
    return this.api.put$(`${ CONTROLLER_ENDPOINT }/${ id }`, body);
  }

  public getById$(id: number): Observable<IBannerReturnView> {
    return this.api.get$<IBannerReturnView>(`${ CONTROLLER_ENDPOINT }/${ id }`);
  }

  public delete$(id: number): Observable<never> {
    return this.api.delete$(`${ CONTROLLER_ENDPOINT }/${ id }`);
  }
}

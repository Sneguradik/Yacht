import { BannerPlaceTypeEnum } from './banner-place-type.enum';
import { BannerPlaceEnum } from './banner-place.enum';

export interface IBannerReturnView {
    id: number;
    createdAt: number;
    updatedAt: number;
    name: string;
    text: string;
    place: BannerPlaceEnum;
    rotation: number;
    url: string;
    clicksCount: number;
    viewsCount: number;
    picture: string;
    active: boolean;
    afterPublication: number;
    placeType: BannerPlaceTypeEnum;
    startDateTime: number;
    stopDateTime: number;
    startViewsTime: number;
    stopViewsCount: number;
    startClicksTime: number;
    stopClicksCount: number;
}

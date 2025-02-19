import { BannerPlaceTypeEnum } from './banner-place-type.enum';
import { BannerPlaceEnum } from './banner-place.enum';

export interface IBannerCreateView {
    name: string;
    text: string;
    place: BannerPlaceEnum;
    rotation: number;
    url: string;
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

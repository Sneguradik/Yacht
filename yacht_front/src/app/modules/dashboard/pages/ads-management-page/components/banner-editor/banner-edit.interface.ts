import { BannerPlaceEnum } from '@api/schemas/advertisement/banner-place.enum';
import { BannerPlaceTypeEnum } from '@api/schemas/advertisement/banner-place-type.enum';

export interface IBannerEdit {
    name: string;
    text: string;
    place: BannerPlaceEnum;
    rotation: number;
    url: string;
    picture: string;
    active: boolean;
    afterPublication: number;
    placeType: BannerPlaceTypeEnum;
    startDateTime: string;
    stopDateTime: string;
    startViewsTime: string;
    stopViewsCount: number;
    startClicksTime: string;
    stopClicksCount: number;
}

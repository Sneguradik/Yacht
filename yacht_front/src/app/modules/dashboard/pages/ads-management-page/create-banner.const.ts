import { IBannerCreateView } from '@api/schemas/advertisement/banner-create-view.interface';
import { BannerPlaceEnum } from '@api/schemas/advertisement/banner-place.enum';

export const CREATE_BANNER: IBannerCreateView = {
    name: null,
    text: null,
    place: BannerPlaceEnum.HEADER,
    rotation: null,
    url: null,
    picture: null,
    active: null,
    afterPublication: null,
    placeType: null,
    startDateTime: null,
    stopDateTime: null,
    startViewsTime: null,
    stopViewsCount: null,
    startClicksTime: null,
    stopClicksCount: null,
};

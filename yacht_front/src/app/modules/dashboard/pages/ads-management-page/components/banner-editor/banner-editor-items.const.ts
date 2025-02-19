import { BannerPlaceEnum } from '@api/schemas/advertisement/banner-place.enum';
import { ISelectItem } from '@modules/dashboard/shared/ui/dashboard-select/select-item.interface';

export const BANNER_EDITOR_ITEMS: ISelectItem[] = [
    {
        id: 0,
        title: 'Хэдер (под хэдером)',
        payload: {
            size: '1440x100',
            type: BannerPlaceEnum.HEADER,
        },
    },
    {
        id: 1,
        title: 'Лента [Л1]',
        payload: {
            size: '1060x100',
            type: BannerPlaceEnum.FEED1,
        },
    },
    {
        id: 2,
        title: 'Лента [Л2]',
        payload: {
            size: '1060x100',
            type: BannerPlaceEnum.FEED2,
        },
    },
    {
        id: 3,
        title: 'Лента [Л3]',
        payload: {
            size: '1060x100',
            type: BannerPlaceEnum.FEED3,
        },
    },
    {
        id: 4,
        title: 'Публикация (под публикацией, над комментариями) [ПП]',
        payload: {
            size: '1060x100',
            type: BannerPlaceEnum.PUBLICATION_ABOVE_COMMENTS,
        },
    },
    {
        id: 5,
        title: 'Публикация (под комментариями) [ПК]',
        payload: {
            size: '1060x100',
            type: BannerPlaceEnum.PUBLICATION_BELOW_COMMENTS,
        },
    },
    {
        id: 6,
        title: 'Публикация / Правый сайдбар [П/ПС]',
        payload: {
            size: '300x600',
            type: BannerPlaceEnum.PUBLICATION_SIDEBAR,
        },
    },
];

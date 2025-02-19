import { BannerStateEnum } from './banner-state.enum';
import { IBannerSortItem } from './banner-sort-item.interface';

export const BANNER_SORT_ITEMS: IBannerSortItem[] = [
    {
        id: 0,
        name: 'Наименование',
        state: BannerStateEnum.UNSELECTED,
        payload: 'NAME_',
    },
    {
        id: 1,
        name: 'Место',
        state: BannerStateEnum.UNSELECTED,
        payload: 'PLACE_',
    },
    {
        id: 2,
        name: 'Активность',
        state: BannerStateEnum.UNSELECTED,
        payload: 'ACTIVITY_',
    },
    {
        id: 3,
        name: 'Дата размещения',
        state: BannerStateEnum.UNSELECTED,
        payload: 'START_DATE_',
    },
    {
        id: 4,
        name: 'Дата завершения',
        state: BannerStateEnum.UNSELECTED,
        payload: 'END_DATE_',
    },
    {
        id: 5,
        name: 'Период размещения',
        state: BannerStateEnum.UNSELECTED,
        payload: 'PLACE_PERIOD_',
    },
    {
        id: 6,
        name: 'Кликов',
        state: BannerStateEnum.UNSELECTED,
        payload: 'CLICKS_',
    },
    {
        id: 7,
        name: 'Показов',
        state: BannerStateEnum.UNSELECTED,
        payload: 'VIEWS_',
    },
    {
        id: 8,
        name: 'К. ротации',
        state: BannerStateEnum.UNSELECTED,
        payload: 'ROTATION_',
    },
    {
        id: 9,
        name: 'ID',
        state: BannerStateEnum.UNSELECTED,
        payload: 'ID_',
    }
];

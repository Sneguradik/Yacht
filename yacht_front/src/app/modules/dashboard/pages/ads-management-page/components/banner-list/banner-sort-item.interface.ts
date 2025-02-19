import { BannerStateEnum } from './banner-state.enum';

export interface IBannerSortItem {
    id: number;
    name: string;
    state: BannerStateEnum;
    payload: string;
}

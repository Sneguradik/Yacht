import { IBannerReturnView } from '@api/schemas/advertisement/banner-return-view.interface';

export interface IBannerPageableContent {
    content: IBannerReturnView[];
    currentPage: number;
    totalPages: number;
    contentLoading: boolean;
}

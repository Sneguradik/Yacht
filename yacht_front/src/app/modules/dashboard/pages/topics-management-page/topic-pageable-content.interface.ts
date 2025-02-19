import { ISelectItem } from '@modules/dashboard/shared/ui/dashboard-select/select-item.interface';

export interface ITopicPageableContent {
    content: ISelectItem[];
    currentPage: number;
    totalPages: number;
    contentLoading: boolean;
}

import { TagOrderEnum } from './tag-order.enum';

export interface ITagQuery {
    page?: number;
    query?: string;
    order?: TagOrderEnum;
    seen?: boolean;
}

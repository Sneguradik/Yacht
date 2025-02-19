import { UserOrderEnum } from './user-order.enum';
import { LocaleEnum } from '../locale/locale.enum';

export interface IUserQuery {
    page?: number;
    sub?: boolean;
    company?: boolean;
    memberOf?: number;
    query?: string;
    order?: UserOrderEnum;
    locale?: LocaleEnum;
    asc?: boolean;
    'rating-after'?: number;
    'rating-before'?: number;
}

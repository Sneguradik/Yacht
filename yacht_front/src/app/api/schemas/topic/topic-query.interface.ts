import { LocaleEnum } from '../locale/locale.enum';
import { TopicOrderEnum } from './topic-order.enum.interface';

export interface ITopicQuery {
    page?: number;
    sub?: boolean;
    query?: string;
    order?: TopicOrderEnum;
    locale?: LocaleEnum;
    asc?: boolean;
    'rating-after'?: number;
    'rating-before'?: number;
}

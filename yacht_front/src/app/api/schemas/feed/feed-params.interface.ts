import { LocaleEnum } from '../locale/locale.enum';
import { PublicationStageEnum } from '../article/publication-stage.enum';
import { SubscriptionFilterEnum } from './subscription-filter.enum';
import { FeedOrderEnum } from './feed-order.enum';

export interface IFeedParams {
    page?: number;
    seen?: boolean;
    sub?: SubscriptionFilterEnum[];
    stage?: PublicationStageEnum[];
    order?: FeedOrderEnum;
    list?: string;
    bookmark?: boolean;
    query?: string;
    asc?: boolean;
    after?: number;
    before?: number;
    viewsAfter?: number;
    commentsAfter?: number;
    topic?: number;
    tag?: number;
    author?: number;
    hidden?: 'include' | 'exclude' | 'only';
    locale?: LocaleEnum;
    company?: boolean;
    bookmarked?: number;
    pinned?: boolean;
    'rating-after'?: number;
    'after-last-online'?: boolean;
}

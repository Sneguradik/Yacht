import { IJobView } from '@api/schemas/job/job-view.interface';
import { IArticleView } from '@api/schemas/article/article-view.interface';
import { ITopicView } from '@api/schemas/topic/topic-view.interface';
import { IEventView } from '@api/schemas/event/event-view.interface';
import { PromotedViewItemTypeEnum } from './promoted-view-item-type.enum';

export interface IPromotedViewItem {
    item: [IArticleView, ITopicView] | IJobView | IEventView;
    type: PromotedViewItemTypeEnum;
}

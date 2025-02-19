import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { IJobView } from '@api/schemas/job/job-view.interface';
import { IArticleView } from '@api/schemas/article/article-view.interface';
import { ITopicView } from '@api/schemas/topic/topic-view.interface';
import { IEventView } from '@api/schemas/event/event-view.interface';

export interface IPromotedItems {
    articles: IPageResponse<[IArticleView, ITopicView]>;
    jobs: IPageResponse<IJobView>;
    events: IPageResponse<IEventView>;
}

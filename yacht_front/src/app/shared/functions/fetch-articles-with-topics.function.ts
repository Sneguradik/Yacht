import { Observable, of } from 'rxjs';
import { IArticleView } from '@api/schemas/article/article-view.interface';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { ITopicView } from '@api/schemas/topic/topic-view.interface';
import { ITopicViewFull } from '@api/schemas/topic/topic-view-full.interface';
import { map, defaultIfEmpty } from 'rxjs/operators';
import { TopicsService } from '@api/routes/topics.service';

export function fetchArticlesWithTopics$(
  page: IPageResponse<IArticleView>,
  topicsService: TopicsService
): Observable<IPageResponse<[IArticleView, ITopicView]>> {
    const topics: number[] = [];
    page.content.forEach((article: IArticleView) => {
        if (article.topics.length > 0) {
            topics.push(article.topics[0]);
        }
    });
    return page.content.length > 0 ? topicsService.getMultiple$(topics).pipe(defaultIfEmpty([]), map((topicsRet: ITopicViewFull[]) => {
        const content: [IArticleView, ITopicView][] = [];
        page.content.forEach((article: IArticleView) => {
            if (article.topics.length > 0) {
                content.push([article, topicsRet.find((x: ITopicViewFull) => x.meta.id === article.topics[0]) as ITopicView]);
            } else {
                content.push([article, null]);
            }
        });
        return { ...page, content };
    })) : of({ ...page, content: [] });
}

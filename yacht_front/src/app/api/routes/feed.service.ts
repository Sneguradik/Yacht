import { Injectable } from '@angular/core';
import { ApiService } from '@api/services/api.service';
import { Observable } from 'rxjs';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { IArticleView } from '@api/schemas/article/article-view.interface';
import { map } from 'rxjs/operators';
import { environment } from '@env';
import { IFeedParams } from '@api/schemas/feed/feed-params.interface';
import { FeedOrderEnum } from '@api/schemas/feed/feed-order.enum';
import { IUnread } from '@api/schemas/feed/unread.interface';
import { PublicationStageEnum } from '@api/schemas/article/publication-stage.enum';
import { IArticleViewBase } from '@api/schemas/article/article-view-base.interface';
import { UnreadFilterEnum } from '@api/schemas/feed/unread-filter.enum';

const CONTROLLER_ENDPOINT = 'feed';

@Injectable({
  providedIn: 'root'
})
export class FeedService {
  constructor(private readonly apiService: ApiService) {}

  public feedRequest$(params: IFeedParams = {}): Observable<IPageResponse<IArticleView>> {
    return this.apiService.get$<IPageResponse<IArticleView>>(CONTROLLER_ENDPOINT, true, params);
  }

  public search$(query: string, page: number = 0): Observable<IPageResponse<IArticleViewBase>> {
    return this.apiService.get$<IPageResponse<IArticleViewBase>>(
      `${ CONTROLLER_ENDPOINT }?page=${ page }&query=${ encodeURIComponent(query) }`, true);
  }

  public count$(params: IFeedParams = {}): Observable<number> {
    return this.apiService.get$<{ count: number }>(`${ CONTROLLER_ENDPOINT }/count`,
      true, params).pipe(map((_: { count: number }) => _.count));
  }

  public unread$(params: IFeedParams = {}): Observable<IUnread> {
    return this.apiService.get$<IUnread>(`${ CONTROLLER_ENDPOINT }/count`, true, { ...params, seen: false });
  }

  public countUnread$(filter?: UnreadFilterEnum, author?: number): Observable<IUnread> {
    return this.apiService.get$<IUnread>(`${ CONTROLLER_ENDPOINT }/count-unread${
      filter ? ('?filter=' + filter + (author ? '&author=' + author : '')) : ''
    }`, true);
  }

  public unreadHeader$(): Observable<IUnread> {
    return this.apiService.get$<IUnread>(`${ CONTROLLER_ENDPOINT }/count?seen=false&sub=author,topic`, true);
  }

  public pinned$(author: number): Observable<IPageResponse<IArticleView>> {
    return this.apiService.get$<IPageResponse<IArticleView>>(`${ CONTROLLER_ENDPOINT }?pinned=true&author=${ author }`, true);
  }

  public drafts$(page: number = 0): Observable<IPageResponse<IArticleView>> {
    return this.feedRequest$({ page, stage: [PublicationStageEnum.DRAFT] });
  }

  public after$(order: FeedOrderEnum, page: number = 0, after?: Date): Observable<IPageResponse<IArticleView>> {
    return this.feedRequest$({ page, after: after ? Math.floor(after.getTime() / 1000) : 0, order });
  }

  public news$(): Observable<IPageResponse<IArticleView>> {
    return this.feedRequest$({ page: 0, topic: environment.newsId, order: FeedOrderEnum.TIME });
  }

  public viewed$(page: number = 0, after: Date = new Date()): Observable<IPageResponse<IArticleView>> {
    return this.feedRequest$({ page, order: FeedOrderEnum.VIEWS, viewsAfter: after.getTime() - 1000 * 60 * 60 * 24 });
  }

  public discussed$(page: number = 0, after?: Date): Observable<IPageResponse<IArticleView>> {
    return this.after$(FeedOrderEnum.COMMENTS, page, after);
  }
}

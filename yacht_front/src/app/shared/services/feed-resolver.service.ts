import { Injectable } from '@angular/core';
import { FeedService } from '@api/routes/feed.service';
import { ActivatedRouteSnapshot, UrlSegment } from '@angular/router';
import { IArticleView } from '@api/schemas/article/article-view.interface';
import { Observable, of, combineLatest } from 'rxjs';
import { PlatformService } from './platform.service';
import { switchMap, map, defaultIfEmpty, catchError } from 'rxjs/operators';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { TopicsService } from '@api/routes/topics.service';
import { FeedOrderEnum } from '@api/schemas/feed/feed-order.enum';
import { ITopicView } from '@api/schemas/topic/topic-view.interface';
import { UsersService } from '@api/routes/users.service';
import { IUserViewFull } from '@api/schemas/user/user-view-full.interface';
import { ITopicViewFull } from '@api/schemas/topic/topic-view-full.interface';

function fetchArticlesWithTopics$(
  page: IPageResponse<IArticleView>,
  topicsService: TopicsService
): Observable<IPageResponse<[IArticleView, ITopicView]>> {
  const topics: Observable<ITopicViewFull>[] = [];
  const topicsIds: number[] = [];
  page.content.forEach((article: IArticleView) => {
    if (article.topics.length > 0) {
      if (!topicsIds.includes(article.topics[0])) {
        topicsIds.push(article.topics[0]);
        topics.push(topicsService.getOne$(article.topics[0]).pipe(catchError(() => of(null))));
      }
    }
  });
  return page.content.length > 0 ? combineLatest(topics).pipe(defaultIfEmpty([]), map((topicsRet: ITopicViewFull[]) => {
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

@Injectable({
  providedIn: 'root'
})
export class FeedResolverService {
  constructor(
    private readonly feedService: FeedService,
    private readonly platformService: PlatformService,
    private readonly topicsService: TopicsService,
    private readonly usersService: UsersService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<[IArticleView, ITopicView][]> {
    if (this.platformService.isServer) {
      const path: string = route.pathFromRoot.map(
        (ars: ActivatedRouteSnapshot) => ars.url.map((segment: UrlSegment) => segment.toString()
      ).join('/')).join('/');
      if (path.includes('/all')) {
        return this.feedService.feedRequest$({ order: FeedOrderEnum.TIME, page: 0 }).pipe(
          switchMap((article: IPageResponse<IArticleView>) => fetchArticlesWithTopics$(article, this.topicsService)),
          map((page: IPageResponse<[IArticleView, ITopicView]>) => page.content),
        );
      }
      if (path.includes('/topics/')) {
        return this.feedService.feedRequest$({ order: FeedOrderEnum.TIME, topic: route.params['id'], page: 0 }).pipe(
          switchMap((article: IPageResponse<IArticleView>) => fetchArticlesWithTopics$(article, this.topicsService)),
          map((page: IPageResponse<[IArticleView, ITopicView]>) => page.content)
        );
      }
      if (path.includes('/tags/')) {
        return this.feedService.feedRequest$({ order: FeedOrderEnum.TIME, tag: route.params['id'], page: 0 }).pipe(
          switchMap((article: IPageResponse<IArticleView>) => fetchArticlesWithTopics$(article, this.topicsService)),
          map((page: IPageResponse<[IArticleView, ITopicView]>) => page.content),
        );
      }
      if (path.includes('/company/') || path.includes('/user/')) {
        return this.usersService.getSingle$(route.params['id']).pipe(
          switchMap((user: IUserViewFull) => this.feedService.feedRequest$({ order: FeedOrderEnum.TIME, author: user.meta.id, page: 0 })),
          switchMap((article: IPageResponse<IArticleView>) => fetchArticlesWithTopics$(article, this.topicsService)),
          map((page: IPageResponse<[IArticleView, ITopicView]>) => page.content)
        );
      }
    }
    return of([]);
  }
}

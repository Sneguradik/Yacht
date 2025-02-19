import { AbstractComponent } from './abstract-component.class';
import { IArticleView } from '@api/schemas/article/article-view.interface';
import { IToggleItem } from '@shared/interfaces/toggle-item.interface';
import { IFeedParams } from '@api/schemas/feed/feed-params.interface';
import { IUserViewFull } from '@api/schemas/user/user-view-full.interface';
import { ActivatedRoute } from '@angular/router';
import { SessionService } from '@app/services/session.service';
import { FeedService } from '@api/routes/feed.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable, combineLatest } from 'rxjs';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { takeUntil, map, switchMap } from 'rxjs/operators';
import { UsersService } from '@api/routes/users.service';
import { ITopicView } from '@api/schemas/topic/topic-view.interface';
import { fetchArticlesWithTopics$ } from '@shared/functions/fetch-articles-with-topics.function';
import { TopicsService } from '@api/routes/topics.service';
import { getUserPostsRanges } from '@modules/user/pages/user-posts-page/user-posts-page-range.const';
import { Component, OnInit } from '@angular/core';
import { PageableContent } from './pageable-conetnt.class';
import { idMap } from '@shared/utils/id-map.operator';

interface IUserPostListRouteData {
    query: IFeedParams;
}

type PageableOptions = [IUserPostListRouteData, IUserViewFull, number];

@Component({
    template: ''
})
// tslint:disable-next-line:component-class-suffix
export class AbstractUserPosts extends AbstractComponent implements OnInit {
    public readonly pageable: PageableContent<[IArticleView, ITopicView], PageableOptions> =
      new PageableContent<[IArticleView, ITopicView], PageableOptions>(this.fetchContent$.bind(this), null);
    public readonly ranges: IToggleItem<never, IFeedParams>[] = getUserPostsRanges(this.translateService);

    public articles: [IArticleView, ITopicView][] = [];
    public pinned: [IArticleView, ITopicView] = null;
    public drafts = false;

    public activeRange = 1;
    public selectedRange: IToggleItem = this.ranges[5];

    constructor(
        protected readonly activatedRoute: ActivatedRoute,
        protected readonly sessionService: SessionService,
        protected readonly feedService: FeedService,
        protected readonly translateService: TranslateService,
        protected readonly usersService: UsersService,
        protected readonly topicsService: TopicsService
    ) {
        super();
    }

    ngOnInit(): void {
        this.pageable.content$.pipe(takeUntil(this.ngOnDestroy$)).subscribe((content: [IArticleView, ITopicView][]) => {
            if (content && content[0] && content[0][0].pinned) {
                this.pinned = content[0];
                content.splice(content.indexOf(content[0]), 1);
            }
            this.articles.push(...content);
        });

        const id$: Observable<number> = this.activatedRoute.paramMap.pipe(
            idMap(),
            switchMap((id: string | number) => this.usersService.getSingle$(id)),
            map((user: IUserViewFull) => user.meta.id),
            takeUntil(this.ngOnDestroy$),
        );

        combineLatest([this.activatedRoute.data as Observable<IUserPostListRouteData>, this.sessionService.user$, id$]).pipe(
            takeUntil(this.ngOnDestroy$)
        ).subscribe((options: [IUserPostListRouteData, IUserViewFull, number]) => {
            this.articles.splice(0, this.articles.length);
            this.pageable.options$.next(options);
            this.pageable.fetch();
        });
    }

    private fetchContent$(page: number, options: PageableOptions): Observable<IPageResponse<[IArticleView, ITopicView]>> {
        const query: {} = this.selectedRange ? this.selectedRange.query : { query: null };
        let result: Observable<IPageResponse<[IArticleView, ITopicView]>>;
        if (options !== null) {
            if (options[0].query.stage && options[0].query.stage[0] === 'DRAFT') {
                this.drafts = true;
            }
            if (options[0].query.bookmark) {
                options[0].query.bookmarked = options[2];
                result = this.feedService.feedRequest$({ ...options[0].query, ...query, page }).pipe(
                    switchMap((_: IPageResponse<IArticleView>) => fetchArticlesWithTopics$(_, this.topicsService))
                );
            } else {
                result = this.feedService.feedRequest$({ ...options[0].query, author: options[2], pinned: true, ...query, page }).pipe(
                    switchMap((_: IPageResponse<IArticleView>) => fetchArticlesWithTopics$(_, this.topicsService))
                );
            }
        } else {
            result = this.feedService.feedRequest$({ ...query, page }).pipe(
                switchMap((_: IPageResponse<IArticleView>) => fetchArticlesWithTopics$(_, this.topicsService))
            );
        }
        return result;
    }

    public rangeEvent(range: IToggleItem): void {
        this.selectedRange = range;
        this.activeRange = range.id;
        this.articles = [];
        this.pageable.page = -1;
    }

    public remove(article: [IArticleView, ITopicView]): void {
        this.articles.splice(this.articles.indexOf(article), 1);
    }
}

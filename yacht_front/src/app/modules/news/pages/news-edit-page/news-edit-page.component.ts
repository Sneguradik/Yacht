import { Component, OnInit, OnDestroy } from '@angular/core';
import { PlatformService } from '@shared/services/platform.service';
import { IArticleViewFull } from '@api/schemas/article/article-view-full.interface';
import { ActivatedRoute, Router } from '@angular/router';
import {
  distinctUntilChanged,
  map,
  mapTo,
  catchError,
  takeUntil,
  debounceTime,
  tap,
  first,
  filter,
  defaultIfEmpty,
  switchMap,
  concatMap
} from 'rxjs/operators';
import { combineLatest, BehaviorSubject, of, Observable, forkJoin, ReplaySubject, from } from 'rxjs';
import { ArticlesService } from '@api/routes/articles.service';
import { TopicsService } from '@api/routes/topics.service';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { ITopicView } from '@api/schemas/topic/topic-view.interface';
import { TagsService } from '@api/routes/tags.service';
import { ITagView } from '@api/schemas/tags/tag-view.interface';
import { PublicationStageEnum } from '@api/schemas/article/publication-stage.enum';
import { TagOrderEnum } from '@api/schemas/tags/tag-order.enum';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { IArticleView } from '@api/schemas/article/article-view.interface';
import { ITagSimpleView } from '@shared/interfaces/tag-simple-view.interface';
import { SidebarWrapperService } from '@layout/sidebar-wrapper/sidebar-wrapper.service';
import { ResponsiveService } from '@app/services/responsive.service';
import { TopicParams } from './topic-params.type';
import { ITopicViewFull } from '@api/schemas/topic/topic-view-full.interface';
import { LocaleEnum } from '@api/schemas/locale/locale.enum';
import { ResolveTagsService } from '@shared/services/resolve-tags.service';
import { Store } from '@ngxs/store';
import { AddToProperty } from '@app/store/user-stats/actions/add-to-property.action';
import { EUserStatsProperty } from '@app/store/user-stats/enums/user-stats-property.enum';


@Component({
  selector: 'app-news-edit-page',
  templateUrl: './news-edit-page.component.html',
  styleUrls: ['./news-edit-page.component.scss']
})
export class NewsEditPageComponent extends AbstractComponent implements OnInit, OnDestroy {
  private readonly isSubmitting$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private readonly tagsPendingUpload$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public readonly suggestions$: ReplaySubject<ITagView[]> = new ReplaySubject<ITagView[]>(1);
  public readonly current$: ReplaySubject<string> = new ReplaySubject<string>(1);

  public articleSource: string;
  public articleData: IArticleViewFull;
  public articleTags: ITagView[];
  public allTopics: ITopicView[] = [];
  public article: IArticleView;
  public topic: ITopicView;
  public openPreview = false;
  public published = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly articlesService: ArticlesService,
    private readonly topicsService: TopicsService,
    private readonly tagsService: TagsService,
    private readonly sidebarWrapperService: SidebarWrapperService,
    private readonly router: Router,
    private readonly resolveTagsService: ResolveTagsService,
    private readonly store: Store,
    public readonly platformsService: PlatformService,
    public readonly responsive$: ResponsiveService,
  ) {
    super();
  }

  ngOnInit(): void {
    if (this.platformsService.isBrowser) {
      setTimeout(() => {
        this.sidebarWrapperService.params$.next({ article: false, trending: true, navigation: true, live: false, showSidebar: true });
      });

      this.isSubmitting$.next(false);
      this.route.params.pipe(
        distinctUntilChanged((x: any, y: any) => x.id === y.id),
        map((_: any) => +_.id),
        switchMap((_: number) => combineLatest([this.articlesService.getSource$(_), this.articlesService.getSingle$(_)])),
        concatMap(([source, data]: [string, IArticleViewFull]) => {
          return this.tagsService.getMultiple$(data.tags).pipe(
            defaultIfEmpty([]),
            map((tags: ITagView[]) => [source, data, tags])
          );
        }),
        takeUntil(this.ngOnDestroy$),
      ).subscribe(([source, data, tags]: [string, IArticleViewFull, ITagView[]]) => {
        this.articleSource = source;
        this.articleData = data;
        this.articleTags = tags;
        this.published = data.status.publicationStage === PublicationStageEnum.PUBLISHED;
      });
      this.getTopicsPage();
      this.setSuggestions();
    }
  }

  private setSuggestions(): void {
    const defaultSuggestions$: ReplaySubject<IPageResponse<ITagView>> = new ReplaySubject<IPageResponse<ITagView>>(1);

    this.tagsService.get$(0, { order: TagOrderEnum.POST_COUNT }).pipe(
      takeUntil(this.ngOnDestroy$)
    ).subscribe(defaultSuggestions$);

    this.current$.pipe(
      distinctUntilChanged(),
      debounceTime(500),
      switchMap((_: string) => _ === '' || !_ ? defaultSuggestions$ : this.tagsService.get$(0, { query: _ })),
      map((_: IPageResponse<ITagView>) => _.content as ITagView[]),
      catchError(() => of([])),
      takeUntil(this.ngOnDestroy$)
    ).subscribe(this.suggestions$);
  }

  private getTopicsPage(params: TopicParams = { loading: false, page: 0, total: 1 }): void {
    params.loading = true;
    this.topicsService.get$(params.page, { locale: LocaleEnum.ALL })
      .pipe(takeUntil(this.ngOnDestroy$))
      .subscribe((_: IPageResponse<ITopicView>) => {
      const result: ITopicView[] = [...this.allTopics];
      result.push(..._.content);
      this.allTopics = result.sort((x: ITopicView, y: ITopicView) => x.info.name.localeCompare(y.info.name));
      params.total = _.totalPages;
      params.loading = false;
      params.page++;
      if (params.page < params.total) {
        this.getTopicsPage(params);
      }
    });
  }

  private save$(article: IArticleViewFull): Observable<any> {
    return forkJoin([
      article.html !== '' ? this.articlesService.putSource$(this.articleData.meta.id, article.html) : of(null),
      this.articlesService.updateSummary$(this.articleData.meta.id, article.info.summary),
      this.articlesService.putTopics$(this.articleData.meta.id, article.topics),
      this.tagsPendingUpload$.pipe(
        filter((_: boolean) => !_),
        first(),
      ),
    ]);
  }

  public updateTopics(topics: number[]): void {
    this.articlesService.putTopics$(this.articleData.meta.id, topics).pipe(takeUntil(this.ngOnDestroy$)).subscribe();
  }

  public updateCover(cover: File): void {
    this.articlesService.updateCover$(this.articleData.meta.id, cover).pipe(takeUntil(this.ngOnDestroy$)).subscribe();
  }

  public updateTitle(title: string): void {
    this.articlesService.updateTitle$(this.articleData.meta.id, title).pipe(takeUntil(this.ngOnDestroy$)).subscribe();
  }

  public updateSummary(summary: string): void {
    this.articlesService.updateSummary$(this.articleData.meta.id, summary).pipe(takeUntil(this.ngOnDestroy$)).subscribe();
  }

  public putSource(source: string): void {
    this.articlesService.putSource$(this.articleData.meta.id, source).pipe(takeUntil(this.ngOnDestroy$)).subscribe();
  }

  public copy(): void {
    this.articlesService.copy$(this.articleData.meta.id).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
      this.published = false;
      this.articleData.status.publicationStage = PublicationStageEnum.DRAFT;
    });
  }

  public saveAndPublish(article: IArticleViewFull): void {
    this.isSubmitting$.next(true);
    this.article = { ...article } as IArticleView;
    this.topic = this.allTopics.find((_: ITopicView) => _.meta.id === (this.articleData.topics ? this.articleData.topics[0] : []));
    this.save$(article)
      .pipe(
        switchMap(() => {
          if (this.articleData.status.publicationStage === PublicationStageEnum.DRAFT) {
            return this.publishOrSubmit$();
          } else {
            return of(true);
          }
        }),
        switchMap((published: boolean) => {
          return published
            ? (() => {
                this.store.dispatch(new AddToProperty(1, EUserStatsProperty.POSTS));
                return from(this.router.navigate(['/', 'news', article.meta.id]));
              })()
            : this.openPreview$();
        }),
        takeUntil(this.ngOnDestroy$))
      .subscribe({
        complete: () => this.isSubmitting$.next(false),
      });
  }

  public tagsUpload(tags: ITagSimpleView[]): void {
    this.tagsPendingUpload$.next(true);
    this.resolveTagsService.resolveTagIds$(tags).pipe(
      first(),
      switchMap((res: number[]) => {
        return this.articlesService.putTags$(this.articleData.meta.id, res).pipe();
      }),
      catchError((error: any) => {
        this.tagsPendingUpload$.next(false);
        throw error;
      }),
      tap(() => this.tagsPendingUpload$.next(false)),
      takeUntil(this.ngOnDestroy$)
    ).subscribe();
  }

  public tagsSuggestions(tag: string): void {
    this.current$.next(tag);
  }

  public openPreview$(): Observable<any> {
    return this.articlesService.getSingle$(this.article.meta.id).pipe(
      switchMap((view: IArticleViewFull) => {
        if (view.topics[0]) { return this.topicsService.getOne$(view.topics[0]).pipe(map((topic: ITopicViewFull) => ({ view, topic }))); }
        return of({ view, topic: null });
      }),
      tap((_: { view: IArticleViewFull, topic: ITopicViewFull }) => {
        this.article = _.view;
        this.topic = _.topic;
        this.openPreview = true;
      }),
      takeUntil(this.ngOnDestroy$)
    );
  }

  public preOff(): void {
    this.articlesService.getSingle$(this.article.meta.id).pipe(
      switchMap((_: IArticleViewFull) => {
        if (_.status.publicationStage === PublicationStageEnum.PUBLISHED) {
          return this.articlesService.copy$(this.article.meta.id).pipe(
            switchMap((id: number) => this.articlesService.delete$(this.article.meta.id).pipe(
              tap(() => this.router.navigate(['/news', id, 'edit']))
            )),
          );
        } else if (_.status.publicationStage === PublicationStageEnum.REVIEWING) {
          return this.articlesService.submit$(this.article.meta.id, true).pipe(
            tap(() => this.openPreview = false)
          );
        }
      }),
      takeUntil(this.ngOnDestroy$)
    ).subscribe();
  }

  public publishOrSubmit$(): Observable<boolean> {
    return this.articlesService.publish$(this.articleData.meta.id).pipe(
      mapTo(true),
      catchError((err: any) => {
        if (err.status === 403) {
          return this.articlesService.submit$(this.articleData.meta.id).pipe(mapTo(false));
        }
        throw err;
      }),
    );
  }

  public saveAsDraft(article: IArticleViewFull): void {
    this.isSubmitting$.next(true);
    this.save$(article).pipe(
      tap(() => this.router.navigate(['/', 'user', 'me', 'drafts'])),
      takeUntil(this.ngOnDestroy$)
    ).subscribe({
      complete: () => this.isSubmitting$.next(false),
    });
  }
}

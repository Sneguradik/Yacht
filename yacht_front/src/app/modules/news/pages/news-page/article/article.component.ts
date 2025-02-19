import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, Output, EventEmitter } from '@angular/core';
import { IArticleViewFull } from '@api/schemas/article/article-view-full.interface';
import { ResponsiveService } from '@app/services/responsive.service';
import { ITopicView } from '@api/schemas/topic/topic-view.interface';
import { ITagView } from '@api/schemas/tags/tag-view.interface';
import { PlatformService } from '@shared/services/platform.service';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { takeUntil } from 'rxjs/operators';
import { IUserViewFull } from '@api/schemas/user/user-view-full.interface';
import { ArticlesService } from '@api/routes/articles.service';
import { UserDropdownService } from '@layout/shared/services/user-dropdown.service';
import { VoteCount } from '@api/schemas/base/voteable.interface';
import { ICommentViewArticle } from '@api/schemas/comment/comment-view-article.interface';
import { BannerPlaceEnum } from '@api/schemas/advertisement/banner-place.enum';
import { VoteAction, VoteActionValues, VoteActionNames, VoteActionValuesNames } from '@shared/components/voting/voting.const';
import { FeedService } from '@api/routes/feed.service';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { IArticleView } from '@api/schemas/article/article-view.interface';
import { TopicsService } from '@api/routes/topics.service';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent extends AbstractComponent implements OnInit, OnDestroy {
  @Input() public data$: BehaviorSubject<IArticleViewFull>;
  @Input() public topics: ITopicView[];
  @Input() public tags: ITagView[];
  @Input() public user: IUserViewFull;
  @Input() public isLogged: boolean;
  @Input() public isBrowser: boolean;
  @Input() public comments: ICommentViewArticle[];

  @Output() public readonly bookmarked: EventEmitter<boolean> = new EventEmitter<boolean>();

  public readonly bannerPlaceEnum: typeof BannerPlaceEnum = BannerPlaceEnum;
  public readonly votes$: BehaviorSubject<VoteCount> = new BehaviorSubject<VoteCount>(null);

  public articles: IArticleView[] = [];
  public cArticles: IArticleViewFull[] = [];
  public topics$: Observable<ITopicView[]>[] = [];
  public bookmarkCounter: number;
  public hasBookmark: boolean;

  constructor(
    private readonly userDropdownService: UserDropdownService,
    private readonly cd: ChangeDetectorRef,
    private readonly articleService: ArticlesService,
    private readonly feedService: FeedService,
    private readonly topicsService: TopicsService,
    public readonly responsive: ResponsiveService,
    public readonly platformService: PlatformService,
    public readonly router: Router,
  ) {
    super();
  }

  ngOnInit(): void {
    const article = this.data$.getValue();
    this.bookmarkCounter = article.bookmarks.count;
    this.hasBookmark = (article.bookmarks && article.bookmarks.you);
    this.data$.pipe(takeUntil(this.ngOnDestroy$)).subscribe((res: IArticleViewFull) => this.votes$.next(res.votes));
    this.getAuthorArticles();
  }

  public toggleBookmark(): void {
    const article = this.data$.getValue();
    if (this.isLogged) {
      const isOwn = article.bookmarks.you;
      this.hasBookmark = !this.hasBookmark;
      this.cd.markForCheck();

      if (isOwn) {
        this.articleService.bookmark$(article.meta.id, isOwn)
          .pipe(takeUntil(this.ngOnDestroy$))
          .subscribe(() => this.bookmarked.next(false));
      } else {
        this.articleService.bookmark$(article.meta.id)
          .pipe(takeUntil(this.ngOnDestroy$))
          .subscribe(() => this.bookmarked.next(true));
      }
      this.hasBookmark ? ++this.bookmarkCounter : --this.bookmarkCounter;
    } else {
      this.userDropdownService.setShowDropdown(true);
    }
  }

  public doVote(vote: VoteAction): void {
    const article = this.data$.getValue();
    const castVote: VoteActionValues = (vote === VoteActionNames.UP)
      ? VoteActionValuesNames.POSITIVE
      : VoteActionValuesNames.NEGATIVE;
    if (article.votes.you === castVote) {
      this.articleService.vote$(article.meta.id, true)
        .pipe(takeUntil(this.ngOnDestroy$))
        .subscribe(() => {
          (castVote > 0) ? article.votes.up -= castVote : article.votes.down += castVote;
          article.votes.you = 0;
          this.data$.next(article);
          this.votes$.next(article.votes);
      });
    } else {
      this.articleService.vote$(article.meta.id, false, castVote)
        .pipe(takeUntil(this.ngOnDestroy$))
        .subscribe(() => {
          (article.votes.you > 0) ? article.votes.up -= article.votes.you : article.votes.down += article.votes.you;
          (castVote > 0) ? article.votes.up += castVote : article.votes.down -= castVote;
          article.votes.you = castVote;
          this.data$.next(article);
          this.votes$.next(article.votes);
      });
    }
  }

  public getAuthorArticles(): void {
    const article = this.data$.getValue();
    this.articles = [];
    this.feedService.feedRequest$({ author: article.authorId })
      .pipe(takeUntil(this.ngOnDestroy$))
      .subscribe((_: IPageResponse<IArticleView>) => {
      for (const i of _.content) {
        if (i.meta.id !== article.meta.id) {
          this.articles.push(i);
          this.topics$.push(this.topicsService.getMultiple$(i.topics || []));
        }
        if (this.articles.length === 3) {
          break;
        }
      }
    });
  }

  public getBack(): void {
    this.router.navigate(['/']);
  }
}

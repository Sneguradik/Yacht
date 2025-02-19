import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ITopicView } from '@api/schemas/topic/topic-view.interface';
import { ITagView } from '@api/schemas/tags/tag-view.interface';
import { ExpandBoxTemplateEnum } from '@shared/ui/expand-box/expand-box-template.enum';
import { Router } from '@angular/router';
import { TopicsService } from '@api/routes/topics.service';
import { SessionService } from '@app/services/session.service';
import { UserDropdownService } from '@layout/shared/services/user-dropdown.service';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { TagsService } from '@api/routes/tags.service';
import { takeUntil, filter } from 'rxjs/operators';
import { ArticlesService } from '@api/routes/articles.service';
import { ISidebarWrapperParams } from '@layout/sidebar-wrapper/sidebar-wrapper-params.interface';
import { ViewportScroller } from '@angular/common';
import { ReportEntityTypeEnum } from '@api/schemas/report/report-entity-type.enum';

@Component({
  selector: 'app-article-info-sidebar',
  templateUrl: './article-info-sidebar.component.html',
  styleUrls: ['./article-info-sidebar.component.scss']
})
export class ArticleInfoSidebarComponent extends AbstractComponent implements OnInit, OnDestroy {
  @Input() public data$: BehaviorSubject<ISidebarWrapperParams>;

  private readonly loggedIn$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public readonly reportEntityTypeEnum: typeof ReportEntityTypeEnum = ReportEntityTypeEnum;

  public topics: ITopicView[] = [];
  public canVote: boolean;
  public tags: ITagView[] = [];

  public share = false;

  public linkBody = '';
  public linkVk: string;
  public linkFb: string;
  public linkTw: string;
  public linkIn: string;
  public linkTg: string;

  public attrsTemplate: ExpandBoxTemplateEnum = ExpandBoxTemplateEnum.ITEMS;
  public tagsTemplate: ExpandBoxTemplateEnum = ExpandBoxTemplateEnum.LINKS;

  constructor(
    private readonly router: Router,
    private readonly topicsService: TopicsService,
    private readonly sessionService: SessionService,
    private readonly tagsService: TagsService,
    private readonly userDropdownService: UserDropdownService,
    private readonly articlesService: ArticlesService,
    private viewport: ViewportScroller,
  ) { super(); }

  ngOnInit(): void {
    this.data$.pipe(filter((params: ISidebarWrapperParams) => !!params.article), takeUntil(this.ngOnDestroy$)).subscribe(() => {
      this.getData();
    });
    this.getData();
    this.linksInit();
    this.subscribeToLoggedIn();
  }

  private linksInit(): void {
    this.linkBody = 'https://ru.yachtsmanjournal.com' + this.router.url;
    this.linkVk = 'https://vk.com/share.php?url=' + this.linkBody;
    this.linkFb = 'https://www.facebook.com/sharer/sharer.php?u=' + this.linkBody;
    this.linkTw = 'https://twitter.com/intent/tweet?url=' + this.linkBody;
    this.linkIn = 'https://vk.com/share.php?url=' + this.linkBody;
    this.linkTg = 'tg://msg_url?url=' + this.linkBody;
  }

  private subscribeToLoggedIn(): void {
    this.sessionService.loggedIn$.pipe(takeUntil(this.ngOnDestroy$)).subscribe((loggedIn: boolean) => {
      this.loggedIn$.next(loggedIn);
    });
  }

  private getData(): void {
    const data = this.data$.getValue().articleData;
    this.topicsService.getMultiple$(data.topics || []).pipe(takeUntil(this.ngOnDestroy$)).subscribe((list: ITopicView[]) => {
      this.topics = list;
    });
    this.tagsService.getMultiple$(data.tags || []).pipe(takeUntil(this.ngOnDestroy$)).subscribe((list: ITagView[]) => {
      this.tags = list;
    });
  }

  public handleSubscribe(item: ITopicView): void {
    if (this.loggedIn$.value) {
      const topics: ITopicView[] = this.topics.map((topic: ITopicView) => {
        if (topic.meta.id === item.meta.id) {
          return {
            ...topic,
            subscribers: {
              ...topic.subscribers,
              you: !item.subscribers.you,
            },
          };
        }
        return topic;
      });

      this.topics = [...topics];

      if (item.hidden) {
        this.topicsService.hide$(item.meta.id, true).pipe(takeUntil(this.ngOnDestroy$)).subscribe();
      }
      this.topicsService.subscribe$(item.meta.id, item.subscribers.you).pipe(takeUntil(this.ngOnDestroy$)).subscribe();
    } else {
      this.userDropdownService.setShowDropdown(true);
    }
  }

  public toggleShare(): void {
    this.share = !this.share;
  }

  public goTo(url: string): void {
    window.open(url, '_blank');
  }

  public emitUnpublish(): void {
    const data = this.data$.getValue().articleData;
    this.articlesService.publish$(data.meta.id, true).pipe(takeUntil(this.ngOnDestroy$)).subscribe();
  }

  public emitHide(): void {
    const data = this.data$.getValue().articleData;
    if (this.loggedIn$.value) {
      if (this.sessionService.loggedIn$.value) {
        data.hidden
          ? this.articlesService.hide$(data.meta.id, true).pipe(takeUntil(this.ngOnDestroy$)).subscribe()
          : this.articlesService.hide$(data.meta.id).pipe(takeUntil(this.ngOnDestroy$)).subscribe();
      } else {
        this.userDropdownService.setShowDropdown(true);
      }
      this.data$.next({ ...this.data$.getValue(), articleData: { ...data, hidden: !data.hidden}});
    } else {
      this.userDropdownService.setShowDropdown(true);
    }
  }

  public scrollToComments(): void {
    window.requestAnimationFrame(() => {
      // this.route.firstChild.firstChild.params.pipe(takeUntil(this.ngOnDestroy$)).subscribe((_: any) => {
      //   if (_.slug) {
      //     this.router.navigate(['/news', _.id, _.slug], { fragment: 'comments-block' });
      //   } else {
      //     this.router.navigate(['/news', _.id], { fragment: 'comments-block' });
      //   }
      // });
      this.viewport.scrollToAnchor('comments-block');
    });
  }

  public emitToggleBookmark(): void {
    const data = this.data$.getValue().articleData;
    if (this.sessionService.loggedIn$.value) {
      if (data.bookmarks.you) {
        this.articlesService.bookmark$(data.meta.id, true)
          .pipe(takeUntil(this.ngOnDestroy$))
          .subscribe(() => {
            --data.bookmarks.count;
          });
      } else {
        this.articlesService.bookmark$(data.meta.id).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
          data.bookmarks.count++;
        });
      }
      data.bookmarks.you = !data.bookmarks.you;
      this.data$.next({ ...this.data$.getValue(), articleData: { ...data }});
    } else {
      this.userDropdownService.setShowDropdown(true);
    }
  }

  public vote(vote: 'up' | 'down'): void {
    const data = this.data$.getValue().articleData;
    const castVote: any = vote === 'up' ? 1 : -1;
    if (data.votes.you === castVote) {
      this.articlesService.vote$(data.meta.id, true).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
        castVote > 0 ? data.votes.up -= castVote : data.votes.down += castVote;
        data.votes.you = 0;
        this.data$.next({ ...this.data$.getValue(), articleData: { ...data }});
      });
    } else {
      this.articlesService.vote$(data.meta.id, false, castVote).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
        data.votes.you > 0 ? data.votes.up -= data.votes.you : data.votes.down += data.votes.you;
        castVote > 0 ? data.votes.up += castVote : data.votes.down -= castVote;
        data.votes.you = castVote;
        this.data$.next({ ...this.data$.getValue(), articleData: { ...data }});
      });
    }
  }
}

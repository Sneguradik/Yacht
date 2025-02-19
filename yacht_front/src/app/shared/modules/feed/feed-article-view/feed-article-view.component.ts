import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { IArticleView } from '@api/schemas/article/article-view.interface';
import { ITopicView } from '@api/schemas/topic/topic-view.interface';
import { ResponsiveService } from '@app/services/responsive.service';
import { PublicationStageEnum } from '@api/schemas/article/publication-stage.enum';
import { IUserFeedInfo } from './user-feed-info.interface';
import { IFeedOptions } from './feed-options.interface';
import { SessionService } from '@app/services/session.service';
import { takeUntil } from 'rxjs/operators';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { UserDropdownService } from '@layout/shared/services/user-dropdown.service';
import { ArticlesService } from '@api/routes/articles.service';
import { VoteActionNames, VoteActionValues, VoteActionValuesNames } from '@shared/components/voting/voting.const';

@Component({
  selector: 'app-feed-article-view',
  templateUrl: './feed-article-view.component.html',
  styleUrls: ['./feed-article-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedArticleViewComponent extends AbstractComponent {
  @Input() public data: IArticleView;
  @Input() public link: [string, string | number];
  @Input() public options: IFeedOptions;
  @Input() public topic: ITopicView;
  @Input() public user: IUserFeedInfo;

  @Output() public readonly gone: EventEmitter<any> = new EventEmitter<any>();
  @Output() public readonly gonePromote: EventEmitter<IArticleView> = new EventEmitter<IArticleView>();
  @Output() public readonly pinned: EventEmitter<[IArticleView, ITopicView]> = new EventEmitter<[IArticleView, ITopicView]>();
  @Output() public readonly goneBookmarked: EventEmitter<[IArticleView, string]> = new EventEmitter<[IArticleView, string]>();

  public readonly publicationStageEnum: typeof PublicationStageEnum = PublicationStageEnum;
  public isLoggedIn =  this.sessionService.loggedIn$;

  constructor(
    private readonly sessionService: SessionService,
    private readonly articlesService: ArticlesService,
    private readonly userDropdown: UserDropdownService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    public readonly responsive: ResponsiveService
  ) {
    super();
  }

  public toggleBookmark(): void {
    if (this.sessionService.loggedIn$.value) {
      this.articlesService.bookmark$(this.data.meta.id, this.data.bookmarks.you)
        .pipe(takeUntil(this.ngOnDestroy$))
        .subscribe(() => {
          this.data.bookmarks.you = !this.data.bookmarks.you;
          this.data.bookmarks.count += this.data.bookmarks.you ? 1 : -1;
          if (!this.data.bookmarks.you) {
            this.goneBookmarked.next([this.data, 'article']);
          }
          this.changeDetectorRef.markForCheck();
        });
    } else {
      this.userDropdown.setShowDropdown(true);
    }
  }

  public doVote(vote: any): void {
    const castVote: VoteActionValues = (vote === VoteActionNames.UP)
      ? VoteActionValuesNames.POSITIVE
      : VoteActionValuesNames.NEGATIVE;
    if (this.data.votes.you === castVote) {
      this.articlesService.vote$(this.data.meta.id, true)
        .pipe(takeUntil(this.ngOnDestroy$))
        .subscribe(() => {
          (castVote > 0) ? this.data.votes.up -= castVote : this.data.votes.down += castVote;
          this.data.votes.you = 0;
          this.changeDetectorRef.markForCheck();
        });
    } else {
      this.articlesService.vote$(this.data.meta.id, false, castVote)
        .pipe(takeUntil(this.ngOnDestroy$))
        .subscribe(() => {
          (this.data.votes.you > 0) ? this.data.votes.up -= this.data.votes.you : this.data.votes.down += this.data.votes.you;
          (castVote > 0) ? this.data.votes.up += castVote : this.data.votes.down -= castVote;
          this.data.votes.you = castVote;
          this.changeDetectorRef.markForCheck();
        });
    }
  }
}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { IArticleView } from '@api/schemas/article/article-view.interface';
import { PublicationStageEnum } from '@api/schemas/article/publication-stage.enum';
import { ArticlesService } from '@api/routes/articles.service';
import { SessionService } from '@app/services/session.service';
import { UserDropdownService } from '@layout/shared/services/user-dropdown.service';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { from } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { IUserViewFull } from '@api/schemas/user/user-view-full.interface';
import { ChangeDetectorRef } from '@angular/core';
import { ShowcasesService } from '@api/routes/showcases.service';
import { ICreatedObject } from '@api/schemas/object/created-object.interface';
import { ITopicView } from '@api/schemas/topic/topic-view.interface';
import { ReportEntityTypeEnum } from '@api/schemas/report/report-entity-type.enum';

@Component({
  selector: 'app-action-menu-article',
  templateUrl: './action-menu-article.component.html',
  styleUrls: ['./action-menu-article.component.scss']
})
export class ActionMenuArticleComponent extends AbstractComponent implements OnInit {
  @Output() public readonly gone: EventEmitter<IArticleView> = new EventEmitter<IArticleView>();
  @Output() public readonly goneBookmarked: EventEmitter<[IArticleView, string]> = new EventEmitter<[IArticleView, string]>();
  @Output() public readonly pinned: EventEmitter<[IArticleView, ITopicView]> = new EventEmitter<[IArticleView, ITopicView]>();
  @Output() public readonly gonePromote: EventEmitter<IArticleView> = new EventEmitter<IArticleView>();

  @Input() public user: IUserViewFull;
  @Input() public isLogged: boolean;
  @Input() public topic: ITopicView;

  @Input() public set data(data: IArticleView) {
    this._data = data;
    this.isHidden = data.hidden;
    this.isPromoteDefault = data.promotions.default;
    this.isBookmarkYou = data.bookmarks.you;
    this.me = this.sessionService.userId && data && data.author.meta.id === this.sessionService.userId;
  }
  public get data(): IArticleView {
    return this._data;
  }

  // tslint:disable-next-line:variable-name
  private _data: IArticleView;
  private isHidden: boolean;

  public readonly reportEntityTypeEnum: typeof ReportEntityTypeEnum = ReportEntityTypeEnum;

  public me = false;
  public company = false;
  public isPromoteDefault: boolean;
  public isBookmarkYou: boolean;

  constructor(
    public readonly userDropdownService: UserDropdownService,
    private readonly sessionService: SessionService,
    private readonly articlesService: ArticlesService,
    private readonly router: Router,
    private readonly showcasesService: ShowcasesService,
    private readonly ref: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.sessionService.user$.pipe(takeUntil(this.ngOnDestroy$)).subscribe((user: IUserViewFull) => {
      this.me = user && this._data && user.meta.id === this._data.author.meta.id;
      this.company = user.info.company.isCompany;
    });
  }

  public bookmark(): void {
    if (this.isLogged) {
      this.articlesService.bookmark$(this.data.meta.id, this.data.bookmarks.you).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
        this.isBookmarkYou = !this.isBookmarkYou;
        this.ref.markForCheck();
        if (this.isBookmarkYou) {
          this.data.bookmarks.count++;
        } else {
          this.data.bookmarks.count--;
          this.goneBookmarked.next([this.data, 'article']);
        }
        this.data.bookmarks.you = !this.data.bookmarks.you;
      });
    } else {
      this.userDropdownService.setShowDropdown(true);
    }
  }

  public hide(): void {
    this.articlesService.hide$(this.data.meta.id, this.data.hidden).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
      this.isHidden = !this.isHidden;
      if (this.isHidden) {
        this.gone.next(this.data);
      }
    });
  }

  public showcase(): void {
    this.articlesService.showcase$(this.data.meta.id).pipe(
      switchMap((created: ICreatedObject) => this.showcasesService.navigate$(created as any)),
      takeUntil(this.ngOnDestroy$)
    ).subscribe();
  }

  public pin(op: boolean): void {
    this.articlesService.pin$(this.data.meta.id, !op).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
      this.data.pinned = op;
      this.pinned.emit(op ? [this.data, this.topic] : null);
    });
  }

  public promote(state: boolean): void {
    this.articlesService.promote$(this.data.meta.id, !state).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
      this.isPromoteDefault = !this.isPromoteDefault;
      if (!this.isPromoteDefault) this.gonePromote.next(this.data);
      this.ref.markForCheck();
    });
  }

  public edit(): void {
    from(this.router.navigate(['/news', this.data.meta.id, 'edit'])).pipe(takeUntil(this.ngOnDestroy$)).subscribe();
  }

  public withdraw(): void {
    this.articlesService.publish$(this.data.meta.id, true).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
      this.gone.next(this.data);
    });
  }

  public delete(): void {
    this.articlesService.delete$(this.data.meta.id).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => this.gone.emit(this.data));
  }

  public publish(): void {
    this.articlesService.publish$(this.data.meta.id).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
      this.gone.next(this.data);
    });
  }

  public submit(): void {
    this.articlesService.submit$(this.data.meta.id).pipe(takeUntil(this.ngOnDestroy$)).subscribe();
  }

  public block(apply: boolean): void {
    this.articlesService.block$(this.data.meta.id, !apply).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
      this.data.status.publicationStage = apply ? PublicationStageEnum.BLOCKED : PublicationStageEnum.DRAFT;
    });
  }
}

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap, takeUntil } from 'rxjs/operators';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { SessionService } from '@app/services/session.service';
import { IUserViewFull } from '@api/schemas/user/user-view-full.interface';
import { ICommentViewArticle } from '@api/schemas/comment/comment-view-article.interface';
import { SortModes } from './comment-section.const';
import { ISortMode } from './sort-mode.const';
import { CommentsService } from '@api/routes/comments.service';
import { ArticlesService } from '@api/routes/articles.service';
import { ICommentViewFeed } from '@api/schemas/comment/comment-view-feed.interface';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-comment-section',
  templateUrl: './comment-section.component.html',
  styleUrls: ['./comment-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentSectionComponent extends AbstractComponent implements OnInit {
  @ViewChild('floatingEditor', { static: true }) public floatingEditor: ElementRef;
  @ViewChild('commentView', { static: true }) public commentView: ElementRef;

  @Output() public readonly addCommentEmit: EventEmitter<void> = new EventEmitter<void>();
  @Output() public readonly addWatchtEmit: EventEmitter<void> = new EventEmitter<void>();

  @Input() public isLogged!: boolean;
  @Input() public user: IUserViewFull;
  @Input() public id!: number;
  @Input() public set articleComments(value: any) {
    this.comments = value;
    this.comments$.next(this.comments);
  }

  private childrenOfCache: { [id: number]: Observable<ICommentViewArticle[]> } = {};

  public comments: ICommentViewArticle[];
  public replyingTo: number;
  public sortModes = SortModes;
  public rootComments$: Observable<ICommentViewArticle[]>;

  public readonly comments$: BehaviorSubject<ICommentViewArticle[]> = new BehaviorSubject<ICommentViewArticle[]>(null);
  public readonly sortMode$: BehaviorSubject<ISortMode> = new BehaviorSubject<ISortMode>(this.sortModes[0]);

  constructor(
    private readonly commentsService: CommentsService,
    private readonly ref: ChangeDetectorRef,
    private readonly articlesService: ArticlesService,
    public readonly sessionService: SessionService,
    public translationServise: TranslateService
  ) {
    super();
  }

  ngOnInit(): void {
    const sortMode$ = this.sortMode$.pipe(distinctUntilChanged());

    this.rootComments$ = this.comments$.pipe(
      filter((res: ICommentViewArticle[]) => !!res),
      switchMap((comments: ICommentViewArticle[]) =>
        sortMode$.pipe(map((mode: ISortMode) =>
          comments.filter((comment: ICommentViewArticle) =>
            !comment.parent || !comment.parent.meta.id).sort(mode.sort)))
      ));
  }

  public childrenOf$(id: number): Observable<ICommentViewArticle[]> {
    if (!this.childrenOfCache[id]) {
      const sortMode$ = this.sortMode$.pipe(distinctUntilChanged());

      this.childrenOfCache[id] = combineLatest([sortMode$, this.comments$.pipe(filter((c: ICommentViewArticle[]) => c !== null))]).pipe(
        map(([mode, comments]: [ISortMode, ICommentViewArticle[]]) => {
          return comments.filter((x: ICommentViewArticle) => x.parent && x.parent.meta.id === id).sort(mode.sort);
        }),
      );
    }

    return this.childrenOfCache[id];
  }

  public hasUndeletedChildren$(id: number): Observable<boolean> {
    return this.comments$.pipe(
      map((comments: ICommentViewArticle[]) => comments.filter(
        (x: ICommentViewArticle) => x.parent && x.parent.meta.id === id && (!x.meta.deletedAt
          || this.hasUndeletedChildren(x.meta.id, comments))).length > 0
      ),
    );
  }

  private hasUndeletedChildren(id: number, comments: ICommentViewArticle[]): boolean {
    return comments.filter((x: ICommentViewArticle) => x.parent && x.parent.meta.id === id && (!x.meta.deletedAt
      || this.hasUndeletedChildren(x.meta.id, comments))).length > 0;
  }

  public retCommString(comments: number): string {
    const num = (Math.abs(comments) % 100) % 10;
    let result;
    if (comments > 10 && comments < 20) {
      result = this.translationServise.instant('COMMON.COMMENTS_');
    } else if (num > 1 && num < 5) {
      result = this.translationServise.instant('COMMON.COMMENTS___');
    } else if (num === 1) {
      result = this.translationServise.instant('COMMON.COMMENTS__');
    } else {
      result = this.translationServise.instant('COMMON.COMMENTS_');
    }
    return result;
  }

  public reply(comment: ICommentViewArticle): void {
    const commentEl: HTMLElement = this.commentView.nativeElement.querySelector(`app-comment[data-id="${comment.meta.id}"]`) as HTMLElement;
    commentEl.parentElement.insertBefore(this.floatingEditor.nativeElement, commentEl.nextSibling);
    this.floatingEditor.nativeElement.classList.remove('hidden');
    this.floatingEditor.nativeElement.querySelector('textarea').focus();
    this.replyingTo = parseInt(commentEl.dataset.id, 10);
    this.ref.markForCheck();
  }

  public closeReply(): void {
    this.floatingEditor.nativeElement.classList.add('hidden');
    this.ref.markForCheck();
  }

  public sendComment$(text: string, parent: number = null): Observable<ICommentViewArticle> {
    return parent !== null
      ? this.articlesService.replyToComment$(this.id, parent, text)
      : this.articlesService.createComment$(this.id, text);
  }

  public sendComment(text: string): void {
    this.sendComment$(text, null)
      .pipe(takeUntil(this.ngOnDestroy$))
      .subscribe((comment: ICommentViewArticle) => {
        this.comments.push(comment);
        this.comments$.next(this.comments);
        this.addCommentEmit.emit();
    });
  }

  public sendReply(text: string): void {
    this.sendComment$(text, this.replyingTo).pipe(takeUntil(this.ngOnDestroy$))
      .subscribe((comment: ICommentViewArticle) => {
        this.comments.push(comment);
        this.comments$.next(this.comments);
        this.floatingEditor.nativeElement.classList.add('hidden');
        this.addCommentEmit.emit();
        this.ref.markForCheck();
    });
  }

  public watch($event: ICommentViewArticle | ICommentViewFeed): void {
    if (this.isLogged) {
      this.commentsService.watch$($event.meta.id, !$event.watch).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
        this.addWatchtEmit.emit();
      });
    }
  }

  public countEvent(commentId: any): void {
    this.comments = this.comments.filter((comment: ICommentViewArticle) => comment.meta.id !== commentId);
    this.comments$.next(this.comments);
  }

  public filterDeleted(array: ICommentViewArticle[]): ICommentViewArticle[] {
    return array.filter((_: ICommentViewArticle) => !_.meta.deletedAt);
  }
}

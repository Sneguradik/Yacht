import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ResponsiveService } from '@app/services/responsive.service';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import linkifyHtml from 'linkifyjs/html';
import { BehaviorSubject } from 'rxjs';
import { skip, takeUntil } from 'rxjs/operators';
import { CommentsService } from '@api/routes/comments.service';
import { ICommentViewArticle } from '@api/schemas/comment/comment-view-article.interface';
import { ICommentViewFeed } from '@api/schemas/comment/comment-view-feed.interface';
import { IUserViewBase } from '@api/schemas/user/user-view-base.interface';
import { ICommentViewBase } from '@api/schemas/comment/comment-view-base.interface';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentComponent extends AbstractComponent implements OnInit, OnDestroy {
  @Input() public comment: ICommentViewFeed | ICommentViewArticle;
  @Input() public author: IUserViewBase;
  @Input() public parent: ICommentViewBase;
  @Input() public parentAuthor: IUserViewBase;
  @Input() public depth: number;
  @Input() public context: number;
  @Input() public extraStyle = false;
  @Input() public ownID: number | null;
  @Input() public isLogged: boolean;

  @Output() public readonly reply: EventEmitter<never> = new EventEmitter<never>();
  @Output() public readonly vote: EventEmitter<'up' | 'down'> = new EventEmitter<'up' | 'down'>();
  @Output() public readonly gone: EventEmitter<void> = new EventEmitter<void>();
  @Output() public readonly watchEmit: EventEmitter<ICommentViewArticle | ICommentViewFeed> =
    new EventEmitter<ICommentViewArticle | ICommentViewFeed>();
  @Output() public readonly deleteComment: EventEmitter<number> = new EventEmitter<number>();

  @ViewChild('renderedContent', { static: true }) public renderedContent: ElementRef;

  private isBellWatched = false;

  public readonly editMode$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public readonly editableContent: FormControl = new FormControl('');
  public readonly processing$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public readonly error$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public reported = false;

  public get commentHtml(): string {
    return linkifyHtml(this.comment.html);
  }

  public get isOwn(): boolean {
    return this.ownID === this.comment.owner.meta.id;
  }

  public get isWatched(): boolean {
    return this.isBellWatched;
  }

  constructor(
    private readonly ref: ChangeDetectorRef,
    public readonly responsive: ResponsiveService,
    public readonly commentsService: CommentsService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.isBellWatched = this.comment.watch;
  }

  public iconSize(depth: number): string {
    switch (depth) {
      case 0:
        return 'large';
      case 1:
        return 'medium';
    }
    return 'small';
  }

  public doCommentVote(comment: ICommentViewArticle | ICommentViewFeed, vote: 'up' | 'down'): void {
    const castVote: any = vote === 'up' ? 1 : -1;
    if (comment.votes.you === castVote) {
      this.commentsService.vote$(comment.meta.id, true).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
        if (castVote > 0) {
          comment.votes.up -= castVote;
        } else {
          comment.votes.down += castVote;
        }
        comment.votes.you = 0;
        this.ref.markForCheck();
      });
    } else {
      this.commentsService.vote$(comment.meta.id, false, castVote).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
        if (comment.votes.you > 0) {
          comment.votes.up -= comment.votes.you;
        } else {
          comment.votes.down += comment.votes.you;
        }
        if (castVote > 0) {
          comment.votes.up += castVote;
        } else {
          comment.votes.down -= castVote;
        }
        comment.votes.you = castVote;
        this.ref.markForCheck();
      });
    }
  }

  public cancel(): void {
    this.editMode$.next(false);
  }


  public edit(): void {
    this.error$.next(false);
    this.commentsService.getSource$(this.comment.meta.id).pipe(
      takeUntil(this.ngOnDestroy$),
      takeUntil(this.editMode$.pipe(skip(1)))
    ).subscribe((_: { source: string }) => {
      this.editMode$.next(true);
      this.editableContent.setValue(_.source);
    });
  }

  public submit(): void {
    this.error$.next(false);
    this.processing$.next(true);
    this.commentsService.setSource$(this.comment.meta.id, this.editableContent.value).pipe(takeUntil(this.ngOnDestroy$)).subscribe(
      (res: { html: string }) => {
        this.comment.html = res.html;
        this.ref.markForCheck();
        this.editMode$.next(false);
      },
      () => {
        this.error$.next(true);
      },
      () => {
        this.processing$.next(false);
      },
    );
  }

  public watch(): void {
    this.watchEmit.emit(this.comment);
    this.isBellWatched = !this.isBellWatched;
    this.ref.markForCheck();
  }

  public delete(id: number): void {
    this.commentsService.delete$(id).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
      this.deleteComment.emit(id);
    });
  }
}

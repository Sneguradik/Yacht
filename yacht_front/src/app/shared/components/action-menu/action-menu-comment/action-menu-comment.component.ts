import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { ICommentViewArticle } from '@api/schemas/comment/comment-view-article.interface';
import { ICommentViewFeed } from '@api/schemas/comment/comment-view-feed.interface';
import { ReportEntityTypeEnum } from '@api/schemas/report/report-entity-type.enum';


@Component({
  selector: 'app-action-menu-comment',
  templateUrl: './action-menu-comment.component.html',
  styleUrls: ['./action-menu-comment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionMenuCommentComponent {
  @Input() public data: ICommentViewFeed | ICommentViewArticle;
  @Input() public own: boolean;

  @Input() public set context(data: number) {
    this._context = data;
  }

  public get context(): number {
    if ('context' in this.data && this.data.context) {
      return this.data.context.meta.id;
    }
    return this._context;
  }

  public readonly reportEntityTypeEnum: typeof ReportEntityTypeEnum = ReportEntityTypeEnum;

  @Output() public readonly report: EventEmitter<ICommentViewArticle | ICommentViewFeed> =
    new EventEmitter<ICommentViewArticle | ICommentViewFeed>();
  @Output() public readonly gone: EventEmitter<void> = new EventEmitter<void>();
  @Output() public readonly edit: EventEmitter<void> = new EventEmitter<void>();
  @Output() public readonly deleteEmit: EventEmitter<number> = new EventEmitter<number>();

  // tslint:disable-next-line:variable-name
  private _context: number;

  constructor() {}

  public delete(): void {
    this.deleteEmit.emit(this.data.meta.id);
  }
}

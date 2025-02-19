import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { IArticleViewFull } from '@api/schemas/article/article-view-full.interface';
import { VoteCount } from '@api/schemas/base/voteable.interface';
import { VoteAction } from '@shared/components/voting/voting.const';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-article-reactions',
  templateUrl: './article-reactions.component.html',
  styleUrls: ['./article-reactions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArticleReactionsComponent {
  @Input() public isBrowser: boolean;
  @Input() public pesponsive: boolean;
  @Input() public data: IArticleViewFull;
  @Input() public commentCounter: number;
  @Input() public votes$: BehaviorSubject<VoteCount>;
  @Input() public watchCounter: number;
  @Input() public hasBookmark: boolean;

  @Input() public set bookmarkCounter(value: number) {
    this.bookmarkCount = value;
  }

  @Output() public readonly toggleEmit: EventEmitter<void> = new EventEmitter<void>();
  @Output() public readonly doVoteEmit: EventEmitter<VoteAction> = new EventEmitter<VoteAction>();

  public bookmarkCount: number;

  constructor() { }

  public toggleBookmark(): void {
    this.toggleEmit.emit();

  }

  public doVote(vote: VoteAction): void {
    this.doVoteEmit.emit(vote);
  }

}

import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { VoteAction, VoteStyle, VoteStyleNames } from './voting.const';

@Component({
  selector: 'app-voting',
  templateUrl: './voting.component.html',
  styleUrls: ['./voting.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VotingComponent {
  @Output() public readonly vote: EventEmitter<VoteAction> = new EventEmitter<VoteAction>();

  @HostBinding('class.article') public hostClassArticle: boolean;
  @HostBinding('class.comment') public hostClassComment: boolean;
  @HostBinding('class.can-vote') public hostClassCanVote: boolean;

  @Input() public castVote: number;
  @Input() public up: number;
  @Input() public down: number;
  @Input() public disabled = false;

  @Input() public set style(style: VoteStyle) {
    this.hostClassArticle = style === VoteStyleNames.ARTICLE;
    this.hostClassComment = style === VoteStyleNames.COMMENT;
  }

  public handleVote(vote: VoteAction): void {
    this.vote.emit(vote);
  }
}

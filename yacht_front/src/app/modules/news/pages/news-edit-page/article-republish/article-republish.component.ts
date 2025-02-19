import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-article-republish',
  templateUrl: './article-republish.component.html',
  styleUrls: ['./article-republish.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArticleRepublishComponent {
  @Output() public readonly copyReq: EventEmitter<void> = new EventEmitter<void>();

  constructor() {}

  public refresh(): void {
    this.copyReq.emit();
  }
}

import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-topics-panel',
  templateUrl: './topics-panel.component.html',
  styleUrls: ['./topics-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopicsPanelComponent {
  @Input() public delete ? = false;
  @Input() public topicName = '';

  @Output() public readonly action: EventEmitter<void> = new EventEmitter<void>();
  @Output() public readonly cancel: EventEmitter<void> = new EventEmitter<void>();

  constructor() {}

  public actionF(): void {
    this.action.emit();
  }

  public cancelF(): void {
    this.cancel.emit();
  }
}

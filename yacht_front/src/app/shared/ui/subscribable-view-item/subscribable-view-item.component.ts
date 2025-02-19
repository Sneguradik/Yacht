import { Component, Input, EventEmitter, Output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-ui-subscribable-view-item',
  templateUrl: './subscribable-view-item.component.html',
  styleUrls: ['./subscribable-view-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubscribableViewItemComponent {
  @Input() public showAdd = true;
  @Input() public disableAdd = false;
  @Input() public item: any;

  @Output() public readonly actionEvent: EventEmitter<never> = new EventEmitter<never>();

  public collapsed = true;

  constructor() {}

  public emitActionEvent(): boolean {
    this.actionEvent.emit();
    return true;
  }

  public toggleCollapse(): void {
    this.collapsed = !this.collapsed;
  }
}

import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { ResponsiveService } from '@app/services/responsive.service';

@Component({
  selector: 'app-ui-info-header',
  templateUrl: './info-header.component.html',
  styleUrls: ['./info-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoHeaderComponent {
  @Input() public bgImage: string;
  @Input() public profileImage: string;
  @Input() public profileText: string;
  @Input() public subscribed = false;
  @Input() public isMe = false;

  @Output() public readonly subscribe: EventEmitter<void> = new EventEmitter<void>();
  @Output() public readonly edit: EventEmitter<void> = new EventEmitter<void>();

  public userId: number;

  constructor(public readonly responsive: ResponsiveService) {}

  public subFunc(): void {
    this.subscribe.emit();
    this.subscribed = !this.subscribed;
  }

  public doEdit(): void {
    this.edit.emit();
  }
}

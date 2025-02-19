import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-create-banner',
  templateUrl: './create-banner.component.html',
  styleUrls: ['./create-banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateBannerComponent {
  @Output() public readonly createReq: EventEmitter<void> = new EventEmitter<void>();
  @Output() public readonly queryReq: EventEmitter<string> = new EventEmitter<string>();

  constructor() {}

  public create(): void {
    this.createReq.emit();
  }

  public query(e: Event): void {
    this.queryReq.emit((e.target as any).value);
  }
}

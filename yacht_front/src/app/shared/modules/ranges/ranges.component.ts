import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { IToggleItem } from '@shared/interfaces/toggle-item.interface';

@Component({
  selector: 'app-ranges',
  templateUrl: './ranges.component.html',
  styleUrls: ['./ranges.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RangesComponent {
  @Input() public ranges: IToggleItem[];
  @Input() public activeRange: number;

  @Output() public readonly toggleRange: EventEmitter<IToggleItem> = new EventEmitter<IToggleItem>();

  public shown = false;

  constructor() {}

  public selectRange(range: IToggleItem): void {
    this.activeRange = range.id === this.activeRange ? -1 : range.id;
    this.toggleRange.emit(this.activeRange === -1 ? null : range);
  }

  public toggle(): void {
    this.shown = !this.shown;
  }
}

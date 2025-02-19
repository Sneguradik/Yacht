import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { IToggleItem } from '@shared/interfaces/toggle-item.interface';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FiltersComponent {
  @Input() public filters: IToggleItem[];
  @Input() public activeFilter: number;

  @Output() public readonly toggleFilter: EventEmitter<IToggleItem> = new EventEmitter<IToggleItem>();

  constructor() {}

  public selectFilter(filter: IToggleItem): void {
    if (filter.id === this.activeFilter) {
      this.activeFilter = -1;
    } else {
      this.activeFilter = filter.id;
    }
    this.toggleFilter.emit(this.activeFilter === -1 ? null : filter);
  }
}

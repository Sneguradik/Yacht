import { Component, Input, Output, EventEmitter, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { DashboardConstants } from '@modules/dashboard/shared/classes/dashboard-constants.class';
import { IStatTags } from './stat-tags.interface';
import { IRangeParams } from '@modules/dashboard/shared/ui/dashboard-range/range-params.interface';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-statistic-tags-block',
  templateUrl: './statistic-tags-block.component.html',
  styleUrls: ['./statistic-tags-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatisticTagsBlockComponent implements OnDestroy {
  @Input() public stat$: BehaviorSubject<IStatTags>;
  @Input() public range$: BehaviorSubject<IRangeParams>;

  @Output() public readonly showReq: EventEmitter<void> = new EventEmitter<void>();

  constructor() {}

  ngOnDestroy(): void {
    this.range$.next(DashboardConstants.RangeParamsConstant);
  }

  public show(): void {
    this.showReq.emit();
  }
}

import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  ChangeDetectionStrategy
} from '@angular/core';
import { DashboardConstants } from '@modules/dashboard/shared/classes/dashboard-constants.class';
import { IActivityView } from '@api/schemas/dashboard/activity-view.interface';
import { IRangeParams } from '@modules/dashboard/shared/ui/dashboard-range/range-params.interface';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-activity-block',
  templateUrl: './activity-block.component.html',
  styleUrls: ['./activity-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityBlockComponent implements OnDestroy {
  @Input() public stat$: BehaviorSubject<IActivityView>;
  @Input() public range$: BehaviorSubject<IRangeParams>;

  @Output() public readonly showReq: EventEmitter<void> = new EventEmitter<void>();

  constructor() { }

  ngOnDestroy(): void {
    if (this.range$) {
      this.range$.next(DashboardConstants.RangeParamsConstant);
    }
  }

  public show(): void {
    this.showReq.emit();
  }
}

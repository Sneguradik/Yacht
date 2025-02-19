import { Component, Input, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { DashboardConstants } from '../../classes/dashboard-constants.class';
import { IRangeParams } from './range-params.interface';
import { IRangeParamsString } from './range-params-string.interface';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-dashboard-range',
  templateUrl: './dashboard-range.component.html',
  styleUrls: ['./dashboard-range.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardRangeComponent implements OnDestroy {
  @Input() public params$: BehaviorSubject<IRangeParams>;

  public paramsString: IRangeParamsString = {
    before: null,
    after: null,
    checkbox: false,
  };

  constructor() {}

  ngOnDestroy(): void {
    if (this.params$) {
      this.params$.next(DashboardConstants.RangeParamsConstant);
    }
  }

  public emitValue(): void {
    const params = {
      before: this.paramsString.before ? new Date(this.paramsString.before.toString()).getTime() : null,
      after: this.paramsString.after ? new Date(this.paramsString.after.toString()).getTime() : null,
      checkbox: this.paramsString.checkbox,
    };
    this.params$.next(params);
  }
}

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnInit
} from '@angular/core';
import { IEventsJobsControl } from '@api/schemas/dashboard/events-jobs-control.interface';
import { BehaviorSubject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-events-jobs-management-block',
  templateUrl: './events-jobs-management-block.component.html',
  styleUrls: ['./events-jobs-management-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventsJobsManagementBlockComponent implements OnInit {
  @Input() public data$: BehaviorSubject<IEventsJobsControl>;
  @Input() public saved = false;

  @Output() public readonly saveReq: EventEmitter<void> = new EventEmitter<void>();
  @Output() public readonly resetReq: EventEmitter<void> = new EventEmitter<void>();

  public viewForm: FormGroup = this.fb.group({
    firstViewEvents: ['', [Validators.required, Validators.min(0)]],
    firstViewJobs: ['', [Validators.required, Validators.min(0)]],
    secondViewEvents: ['', [Validators.required, Validators.min(0)]],
    secondViewJobs: ['', [Validators.required, Validators.min(0)]],
    thirdViewEvents: ['', [Validators.required, Validators.min(0)]],
    thirdViewJobs: ['', [Validators.required, Validators.min(0)]]
  });

  constructor(private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this._setFormValue();
  }

  private _setFormValue(): void {
    this.data$.pipe(filter(Boolean)).subscribe((data: IEventsJobsControl) => {
      this.viewForm.setValue({
        firstViewEvents: data.firstView.events,
        firstViewJobs: data.firstView.jobs,
        secondViewEvents: data.secondView.events,
        secondViewJobs: data.secondView.jobs,
        thirdViewEvents: data.thirdView.events,
        thirdViewJobs: data.thirdView.jobs
      });
    });
  }

  public reset(): void {
    this.resetReq.emit();
  }

  public changeData(value: boolean, patch: string, type: string): void {
    this.data$.next({...this.data$.getValue(), [patch]: {...this.data$.getValue()[patch], [type]: value}});
  }

  public paramsSwitcher(): void {
    this.data$.next({
      ...this.data$.getValue(),
      publicationsBottom: !this.data$.getValue().publicationsBottom
    });
  }

  public save(): void {
    this.data$.next({
      ...this.data$.getValue(),
      firstView: {
        jobs: Number(this.viewForm.get('firstViewJobs').value),
        events: Number(this.viewForm.get('firstViewEvents').value)
      },
      secondView: {
        jobs: Number(this.viewForm.get('secondViewJobs').value),
        events: Number(this.viewForm.get('secondViewEvents').value)
      },
      thirdView: {
        jobs: Number(this.viewForm.get('thirdViewJobs').value),
        events: Number(this.viewForm.get('thirdViewEvents').value)
      }
    });
    this.saveReq.emit();
  }
}

import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import { IRatingData } from '@api/schemas/dashboard/ratings-data.interface';
import { ISelectItem } from '@modules/dashboard/shared/ui/dashboard-select/select-item.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-ratings-form-block',
  templateUrl: './ratings-form-block.component.html',
  styleUrls: ['./ratings-form-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RatingsFormBlockComponent implements OnChanges {
  @Input() public data: IRatingData;
  @Input() public saved = false;

  @Output() public readonly dataChange: EventEmitter<IRatingData> = new EventEmitter<IRatingData>();
  @Output() public readonly submitReq: EventEmitter<void> = new EventEmitter<void>();

  public avarageItems: ISelectItem[] = [
    {
      title: 'Медиана',
      id: 0,
      payload: 'MEDIAN',
    },
    {
      title: 'Среднее арифметическое',
      id: 1,
      payload: 'MEAN',
    },
  ];
  public selectedAvarage: ISelectItem = this.avarageItems[0];
  public resetData: IRatingData = null;
  public form: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data) {
      if (this.data) {
        if (this.resetData === null) {
          this.resetData = { ...this.data };
        }
        this.parseAvarage(this.data.userRanking);

        this.form = this.fb.group({
          views: [this.data.views, [Validators.required, Validators.min(0)]],
          comments: [this.data.comments, [Validators.required, Validators.min(0)]],
          favourites: [this.data.favourites, [Validators.required, Validators.min(0)]],
          likes: [this.data.likes, [Validators.required, Validators.min(0)]],
          dislikes: [this.data.dislikes, [Validators.required, Validators.min(0)]],
          factor1: [this.data.factor1, [Validators.required, Validators.min(0)]],
          factor2: [this.data.factor2, [Validators.required, Validators.min(0)]],
          divider: [this.data.divider, [Validators.required, Validators.min(0)]],
          days: [this.data.days, [Validators.required, Validators.min(0)]],
        });
      }
    }
  }

  private parseAvarage(avarage: string): void {
    switch (avarage) {
      case 'MEAN':
        this.selectedAvarage = this.avarageItems[1];
        break;
      case 'MEDIAN':
        this.selectedAvarage = this.avarageItems[0];
        break;
    }
  }

  public submit(): void {
    this.data.userRanking = this.selectedAvarage.payload;
    this.dataChange.emit({...this.form.getRawValue(), userRanking: this.data.userRanking});
    this.submitReq.emit();
  }

  public reset(): void {
    this.data = { ...this.resetData };
    this.dataChange.emit(this.data);
    this.parseAvarage(this.data.userRanking);
  }
}

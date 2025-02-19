import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { IBannerReturnView } from '@api/schemas/advertisement/banner-return-view.interface';
import { IBannerCreateView } from '@api/schemas/advertisement/banner-create-view.interface';
import { BannerPlaceEnum } from '@api/schemas/advertisement/banner-place.enum';
import { BannerPlaceTypeEnum } from '@api/schemas/advertisement/banner-place-type.enum';
import { BANNER_EDITOR_ITEMS } from './banner-editor-items.const';
import { ISelectItem } from '@modules/dashboard/shared/ui/dashboard-select/select-item.interface';
import { BehaviorSubject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-banner-editor',
  templateUrl: './banner-editor.component.html',
  styleUrls: ['./banner-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BannerEditorComponent implements OnInit {
  @ViewChild('image', { static: false }) private imageInput: ElementRef;

  @Input() public inputData$: BehaviorSubject<IBannerReturnView>;

  @Output() public readonly cancelReq: EventEmitter<void> = new EventEmitter<void>();
  @Output() public readonly saveReq: EventEmitter<[number, IBannerCreateView]> = new EventEmitter<[number, IBannerCreateView]>();
  @Output() public readonly savePlaceReq: EventEmitter<[number, BannerPlaceEnum]> = new EventEmitter<[number, BannerPlaceEnum]>();
  @Output() public readonly pictureReq: EventEmitter<[number, File]> = new EventEmitter<[number, File]>();

  public items: ISelectItem[] = BANNER_EDITOR_ITEMS;
  public selectedPlace: ISelectItem = this.items[0];
  public BannerPlaceTypeEnum: typeof BannerPlaceTypeEnum = BannerPlaceTypeEnum;
  public imagePreview: string = null;
  public now = Date.now();
  public minDateTime = this.datePipe.transform(this.now, 'yyyy-MM-dd');

  public adsForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private readonly datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    const data = this.inputData$.getValue();
    this.adsForm = this.fb.group({
      name: [data.name, [Validators.required]],
      afterPublication: [data.afterPublication, [Validators.min(0), Validators.pattern('^[0-9]*$')]],
      startDateTime: [this.datePipe.transform(data.startDateTime, 'yyyy-MM-dd'), []],
      stopDateTime: [this.datePipe.transform(data.stopDateTime, 'yyyy-MM-dd'), []],
      startViewsTime: [this.datePipe.transform(data.startViewsTime, 'yyyy-MM-dd'), []],
      stopViewsCount: [data.stopViewsCount, [Validators.min(0), Validators.pattern('^[0-9]*$')]],
      startClicksTime: [this.datePipe.transform(data.startClicksTime, 'yyyy-MM-dd'), []],
      stopClicksCount: [data.stopClicksCount, [Validators.min(0), Validators.pattern('^[0-9]*$')]],
      rotation: [data.rotation, [Validators.min(0), Validators.pattern('^[0-9]*$')]],
      url: [data.url, []],
      text: [data.text, []],
      active: [data.active, []],
      placeType: [data.placeType],
      [BannerPlaceTypeEnum.TIME_INTERVAL]: [data.placeType === BannerPlaceTypeEnum.TIME_INTERVAL],
      [BannerPlaceTypeEnum.VIEWS_COUNT]: [data.placeType === BannerPlaceTypeEnum.VIEWS_COUNT],
      [BannerPlaceTypeEnum.CLICKS_COUNT]: [data.placeType === BannerPlaceTypeEnum.CLICKS_COUNT],
      img: [null, []]
    });
    this.parsePlace();
  }

  private sendImg(): void {
    this.pictureReq.emit([this.inputData$.getValue().id, this.adsForm.controls.img.value]);
  }

  private parsePlace(): void {
    switch (this.inputData$.getValue().place) {
      case BannerPlaceEnum.HEADER:
        this.selectedPlace = this.items[0];
        break;
      case BannerPlaceEnum.FEED1:
        this.selectedPlace = this.items[1];
        break;
      case BannerPlaceEnum.FEED2:
        this.selectedPlace = this.items[2];
        break;
      case BannerPlaceEnum.FEED3:
        this.selectedPlace = this.items[3];
        break;
      case BannerPlaceEnum.PUBLICATION_ABOVE_COMMENTS:
        this.selectedPlace = this.items[4];
        break;
      case BannerPlaceEnum.PUBLICATION_BELOW_COMMENTS:
        this.selectedPlace = this.items[5];
        break;
      case BannerPlaceEnum.PUBLICATION_SIDEBAR:
        this.selectedPlace = this.items[6];
        break;
    }
  }

  public setPlaceType(type: BannerPlaceTypeEnum): void {
    switch (type) {
      case BannerPlaceTypeEnum.CLICKS_COUNT: {
        this.adsForm.controls[BannerPlaceTypeEnum.TIME_INTERVAL].setValue(false);
        this.adsForm.controls[BannerPlaceTypeEnum.VIEWS_COUNT].setValue(false);
        this.adsForm.controls.placeType.setValue(BannerPlaceTypeEnum.CLICKS_COUNT);
        break;
      }
      case BannerPlaceTypeEnum.TIME_INTERVAL: {
        this.adsForm.controls[BannerPlaceTypeEnum.CLICKS_COUNT].setValue(false);
        this.adsForm.controls[BannerPlaceTypeEnum.VIEWS_COUNT].setValue(false);
        this.adsForm.controls.placeType.setValue(BannerPlaceTypeEnum.TIME_INTERVAL);
        break;
      }
      case BannerPlaceTypeEnum.VIEWS_COUNT: {
        this.adsForm.controls[BannerPlaceTypeEnum.CLICKS_COUNT].setValue(false);
        this.adsForm.controls[BannerPlaceTypeEnum.TIME_INTERVAL].setValue(false);
        this.adsForm.controls.placeType.setValue(BannerPlaceTypeEnum.VIEWS_COUNT);
      }
    }
  }

  public onImageChange(event: any): void {
    if (event.target.files.length) {
      this.adsForm.controls.img.setValue(event.target.files[0]);
    }

    this.sendImg();
  }

  public clearImg(): void {
    if (this.adsForm.controls.img.value) {
      this.adsForm.controls.img.setValue(null);
      this.imageInput.nativeElement.value = '';
      this.sendImg();
    }
  }

  public onPlaceChange(place: ISelectItem): void {
    this.savePlaceReq.emit([this.inputData$.getValue().id, place.payload.type]);
  }

  public save(): void {
    const data = this.adsForm.getRawValue();
    const ret: IBannerCreateView = {
      ...data,
      startDateTime: data.startDateTime ? new Date(data.startDateTime).getTime() : null,
      stopDateTime: data.stopDateTime ? new Date(data.stopDateTime).getTime() : null,
      startViewsTime: data.startViewsTime ? new Date(data.startViewsTime).getTime() : null,
      startClicksTime: data.startClicksTime ? new Date(data.startClicksTime).getTime() : null,
      picture: this.inputData$.getValue().picture,
      place: this.selectedPlace.payload.type,
    };
    this.saveReq.emit([this.inputData$.getValue().id, ret]);
  }

  public cancel(): void {
    this.cancelReq.emit();
  }
}

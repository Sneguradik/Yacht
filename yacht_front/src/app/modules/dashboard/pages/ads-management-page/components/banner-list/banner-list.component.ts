import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import { IBannerReturnView } from '@api/schemas/advertisement/banner-return-view.interface';
import { IBannerSortItem } from './banner-sort-item.interface';
import { BANNER_SORT_ITEMS } from './banner-sort-items.const';
import { BannerStateEnum } from './banner-state.enum';
import { BannerPlaceEnum } from '@api/schemas/advertisement/banner-place.enum';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-banner-list',
  templateUrl: './banner-list.component.html',
  styleUrls: ['./banner-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BannerListComponent {
  @Input() public banners$: Subject<IBannerReturnView[]>;

  @Output() public readonly actionReq: EventEmitter<[number, string, boolean?]> = new EventEmitter<[number, string, boolean?]>();
  @Output() public readonly sortReq: EventEmitter<string[]> = new EventEmitter<string[]>();

  public sortItems: IBannerSortItem[] = BANNER_SORT_ITEMS;
  public StateEnum: typeof BannerStateEnum = BannerStateEnum;
  public sort: IBannerSortItem[] = [];

  constructor() { }

  public parseDate(date: string | number): string {
    const temp: Date = new Date(date);
    return date ? temp.getUTCDate() + '.' + (temp.getUTCMonth() + 1) + '.' + temp.getUTCFullYear() : null;
  }

  public returnState(item: IBannerSortItem): BannerStateEnum {
    return this.sortItems.filter((_: IBannerSortItem) => _.id === item.id)[0].state;
  }

  private changeSortItem(item: IBannerSortItem): void {
    this.sortItems[item.id].state =
      this.sortItems[item.id].state === BannerStateEnum.UNSELECTED
        ? BannerStateEnum.SELECTED_DESC
        : this.sortItems[item.id].state === BannerStateEnum.SELECTED_DESC
        ? BannerStateEnum.SELECTED_ASC
        : BannerStateEnum.UNSELECTED;
  }

  public changeSort(item: IBannerSortItem): void {
    this.changeSortItem(item);
    this.sort = this.sort.filter((x: IBannerSortItem) => x.id !== item.id);
    if (this.sortItems[item.id].state !== BannerStateEnum.UNSELECTED) {
      if (this.sort.length === 3) {
        this.sort.shift();
      }
      this.sort.push({ ...this.sortItems[item.id] });
    }
    this.parseSort();
  }

  private parseSort(): void {
    const str: string[] = [];
    this.sort.forEach((element: IBannerSortItem) => {
      str.push(element.payload + (element.state === BannerStateEnum.SELECTED_DESC ? 'DESC' : 'ASC'));
    });
    this.sortReq.emit(str);
  }

  public parseActivity(activity: boolean): string {
    return activity ? 'да' : 'нет';
  }

  public getDateDifference(date1: string | number, date2: string | number): number {
    const temp1: Date = new Date(date1);
    const temp2: Date = new Date(date2);
    return date1 && date2 ? Math.ceil(Math.abs(temp1.getTime() - temp2.getTime()) / (1000 * 60 * 60 * 24)) : null;
  }

  public parsePlace(place: BannerPlaceEnum): string {
    switch (place) {
      case BannerPlaceEnum.FEED1:
        return 'Лента [Л1]';
      case BannerPlaceEnum.FEED2:
        return 'Лента [Л2]';
      case BannerPlaceEnum.FEED3:
        return 'Лента [Л3]';
      case BannerPlaceEnum.HEADER:
        return 'Хэдер (под хэдером)';
      case BannerPlaceEnum.PUBLICATION_ABOVE_COMMENTS:
        return 'Публикация (под публикацией, над комментариями) [ПП]';
      case BannerPlaceEnum.PUBLICATION_BELOW_COMMENTS:
        return 'Публикация (под комментариями) [ПК]';
      case BannerPlaceEnum.PUBLICATION_SIDEBAR:
        return 'Публикация / Правый сайдбар [П/ПС]';
      default:
        return null;
    }
  }

  public makeAction(id: number, action: string, param?: boolean): void {
    if (param) {
      this.actionReq.emit([id, action, param]);
    } else {
      this.actionReq.emit([id, action]);
    }
  }
}

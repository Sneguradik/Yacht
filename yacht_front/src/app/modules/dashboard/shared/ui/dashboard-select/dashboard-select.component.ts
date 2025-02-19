import { Component, EventEmitter, Output, Input, SimpleChanges, OnChanges, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { DashboardConstants } from '../../classes/dashboard-constants.class';
import { ISelectItem } from './select-item.interface';

@Component({
  selector: 'app-dashboard-select',
  templateUrl: './dashboard-select.component.html',
  styleUrls: ['./dashboard-select.component.scss'],
})
export class DashboardSelectComponent implements OnChanges, OnDestroy {

  constructor(private readonly ref: ElementRef) {}

  @Input() public items: ISelectItem[] = [];
  @Input() public dropdownWidth: number = null;
  @Input() public selected: ISelectItem = DashboardConstants.SelectItemConstant;

  @Output() public readonly selectedChange: EventEmitter<ISelectItem> = new EventEmitter<ISelectItem>();
  @Output() public readonly changeRes?: EventEmitter<ISelectItem> = new EventEmitter<ISelectItem>();

  public dropdown = false;
  @HostListener('document:click', ['$event']) public clickOut(event: any): void {
    if (!this.ref.nativeElement.contains(event.target)) {
      this.dropdown = false;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.selected) {
      if (changes.selected.currentValue !== changes.selected.previousValue) {
        this.selectedChange.emit(this.selected);
      }
      if (changes.selected.currentValue === DashboardConstants.SelectItemConstant &&
          changes.selected.currentValue !== changes.selected.previousValue) {
        this.clear();
      }
    }
  }

  ngOnDestroy(): void {
    this.clear();
  }

  public select(item: ISelectItem): void {
    this.selectedChange.emit(item);
    this.changeRes.emit(item);
    this.selected = item ? item : DashboardConstants.SelectItemConstant;
  }

  public clear(): void {
    this.dropdown = false;
    this.selected = DashboardConstants.SelectItemConstant;
  }

  public switchDropdownState(): void {
    this.dropdown = !this.dropdown;
  }
}

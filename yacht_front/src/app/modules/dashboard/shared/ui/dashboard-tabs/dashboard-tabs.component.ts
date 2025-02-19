import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { DashboardConstants } from '../../classes/dashboard-constants.class';
import { ITabsNavItem } from './tabs-nav-item.interface';
import { ISelectItem } from '../dashboard-select/select-item.interface';

@Component({
  selector: 'app-dashboard-tabs',
  templateUrl: './dashboard-tabs.component.html',
  styleUrls: ['./dashboard-tabs.component.scss'],
})
export class DashboardTabsComponent implements OnInit {
  @Input() public navs: ITabsNavItem[] = [];
  @Input() public filters: ISelectItem[] = [];
  @Input() public activeFilter: ISelectItem = DashboardConstants.SelectItemConstant;

  @Output() public readonly showReq: EventEmitter<ISelectItem> = new EventEmitter<ISelectItem>();
  @Output() public readonly selectedNav: EventEmitter<ITabsNavItem> = new EventEmitter<ITabsNavItem>();

  public activeNav: ITabsNavItem;

  constructor() {}

  ngOnInit(): void {
    this.activeNav = this.navs[0];
  }

  public selectNav(nav: ITabsNavItem): void {
    this.activeNav = nav;
    this.selectedNav.emit(nav);
  }

  public show(): void {
    this.showReq.emit(this.activeFilter);
  }
}

import { Component, Input, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { IFeedNavDropdown } from './feed-nav-dropdown.interface';
import { PlatformService } from '@shared/services/platform.service';
import { IMenuState } from '@layout/shared/interfaces/menu-state.interface';
import { toggleFn } from '@layout/shared/functions/toggle-fn.function';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';


@Component({
  selector: 'app-feed-nav-item',
  templateUrl: './feed-nav-item.component.html',
  styleUrls: ['../../../../header/header.component.scss', './feed-nav-item.component.scss']
})
export class FeedNavItemComponent extends AbstractComponent implements OnDestroy {
  @ViewChild('dropdown') public dropdown: ElementRef;

  @Input() public selected = false;
  @Input() public link: string | string[] = '';
  @Input() public dropdownConf: IFeedNavDropdown = { hasDropdown: false };
  @Input() public count?: number;
  @Input() public text = '';
  @Input() public isSecondHeader = false;
  @Input() public dropdownExtraClass = '';
  @Input() public dropAction = false;

  public state: IMenuState = { shown: false, sub: null };
  public readonly toggle: any = this.platformService.isBrowser
    ? toggleFn(this.state, () => this.dropdown, takeUntil(this.ngOnDestroy$)) : () => {};

  @Input() public handleClick: CallableFunction = () => {};

  constructor(
    private readonly platformService: PlatformService,
    private readonly router: Router
  ) {
    super();
  }

  public action(): void {
    if (this.dropAction) {
      this.toggle();
    } else {
      this.router.navigate(typeof this.link === 'string' ? [this.link] : this.link);
    }
  }
}

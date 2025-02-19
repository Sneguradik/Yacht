import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { LocalStorageKeyEnum } from '@shared/enums/local-storage-key.enum';
import { Router, NavigationEnd, RouterEvent } from '@angular/router';
import { PlatformService } from '@shared/services/platform.service';
import { filter, takeUntil } from 'rxjs/operators';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { BannerPlaceEnum } from '@api/schemas/advertisement/banner-place.enum';
import { MoreMenuWrapperComponent } from '@shared/modules/more-menu/more-menu-wrapper/more-menu-wrapper.component';
import { MoreMenuService } from '@shared/modules/more-menu/more-menu.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent extends AbstractComponent implements OnInit, OnDestroy {
  @ViewChild('globalMenu', { static: true }) public wrapper: MoreMenuWrapperComponent;

  public readonly BannerPlaceEnum: typeof BannerPlaceEnum = BannerPlaceEnum;

  constructor(
    private readonly router: Router,
    private readonly platformService: PlatformService,
    public readonly moreMenuService: MoreMenuService
  ) {
    super();
  }

  ngOnInit(): void {
    if (this.platformService.isBrowser) {
      this.router.events.pipe(filter((event: RouterEvent) => event instanceof NavigationEnd))
        .pipe(takeUntil(this.ngOnDestroy$))
        .subscribe(() =>
          window.scrollTo(0, 0));
      this.moreMenuService.wrapper = this.wrapper;

      const cookiesBannerStatus: boolean = !!localStorage.getItem(LocalStorageKeyEnum.COOKIES_BANNER);

      if (!cookiesBannerStatus) {
        localStorage.setItem(LocalStorageKeyEnum.COOKIES_BANNER, 'false');
      }
    }
  }
}

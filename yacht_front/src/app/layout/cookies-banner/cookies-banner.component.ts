import { Component, OnInit } from '@angular/core';
import { LocalStorageKeyEnum } from '@shared/enums/local-storage-key.enum';
import { PlatformService } from '@shared/services/platform.service';

@Component({
  selector: 'app-cookies-banner',
  templateUrl: './cookies-banner.component.html',
  styleUrls: ['./cookies-banner.component.scss']
})
export class CookiesBannerComponent implements OnInit {
  public show = true;

  constructor(
    private readonly platformService: PlatformService
  ) {}

  ngOnInit(): void {
    if (this.platformService.isBrowser) {
      if (localStorage.getItem(LocalStorageKeyEnum.COOKIES_BANNER) === 'true') {
        this.show = false;
      }
    }
  }

  public btnClick(): void {
    localStorage.setItem(LocalStorageKeyEnum.COOKIES_BANNER, 'true');
    this.show = false;
  }
}

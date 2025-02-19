import { Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ResponsiveService } from '@app/services/responsive.service';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { AdvertisementService } from '@api/routes/advertisement.service';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { IBannerReturnView } from '@api/schemas/advertisement/banner-return-view.interface';
import { BannerPlaceEnum } from '@api/schemas/advertisement/banner-place.enum';
import { IBannerPageableContent } from '@modules/dashboard/pages/ads-management-page/banner-pageable-content.interface';
import { PlatformService } from '@shared/services/platform.service';

@Component({
  selector: 'app-ad-banner',
  templateUrl: './ad-banner.component.html',
  styleUrls: ['./ad-banner.component.scss'],
})
export class AdBannerComponent extends AbstractComponent implements OnInit, OnDestroy {

  constructor(
    private readonly advertisementService: AdvertisementService,
    private readonly platformService: PlatformService,
    public readonly responsive: ResponsiveService
  ) {
    super();
  }

  @ViewChild('adElem', { static: false }) public adElem: ElementRef;

  @Input() public place: BannerPlaceEnum;
  @Input() public sidebar = false;

  public ad: IBannerPageableContent = {
    content: [],
    currentPage: 0,
    totalPages: 1,
    contentLoading: false,
  };
  public adNum = 0;
  public adViewedProp = false;

  ngOnInit(): void {
    if (this.place && this.platformService.isBrowser) {
      this.getAd();
    }
  }

  @HostListener('window:scroll', ['$event']) public onScroll(): void {
    if (!this.adViewedProp && this.ad.content[0] && this.adElem) {
      this.adViewed();
    }
  }

  public fetchAd(): void {
    if ((this.ad.content === [] || this.ad.currentPage + 1 <= this.ad.totalPages) && !this.ad.contentLoading) {
      this.ad.contentLoading = true;
      this.advertisementService.get$(this.ad.currentPage, this.place)
        .pipe(takeUntil(this.ngOnDestroy$))
        .subscribe((banners: IPageResponse<IBannerReturnView>) => {
          this.ad.content.push(...banners.content);
          this.ad.totalPages = banners.totalPages;
          this.ad.currentPage++;
          this.ad.contentLoading = false;
          if (this.ad.currentPage + 1 <= this.ad.totalPages) {
            this.getAd();
          } else {
            if (this.ad.content[0]) {
              if (!localStorage.getItem('ad-' + this.place)) {
                localStorage.setItem('ad-' + this.place, '1');
                this.adNum = 0;
              } else {
                this.adNum = parseInt(localStorage.getItem('ad-' + this.place), 10) - 1;
                if (this.adNum + 1 < this.ad.content.length) {
                  this.adNum++;
                } else {
                  this.adNum = 0;
                }
                localStorage.setItem('ad-' + this.place, this.adNum + 1 + '');
              }
            }
          }
          if (this.place === BannerPlaceEnum.HEADER) {
            setTimeout(() => this.adElem ? this.adViewed() : () => {});
          }
        });
    }
  }

  public getAd(): void {
    this.fetchAd();
  }

  public adViewed(): void {
    const rect = this.adElem.nativeElement.getBoundingClientRect();
    const viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
    if (!(rect.bottom < 0 || rect.top - viewHeight >= 0) && !this.adViewedProp) {
      this.advertisementService.view$(this.ad.content[this.adNum].id).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => { });
      this.adViewedProp = true;
    }
  }

  public adClicked(): void {
    this.advertisementService.click$(this.ad.content[this.adNum].id).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() =>
      window.open(this.ad.content[this.adNum].url, '_blank')
    );
  }
}

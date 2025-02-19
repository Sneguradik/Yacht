import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { catchError, takeUntil, switchMap, tap } from 'rxjs/operators';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { IBannerPageableContent } from './banner-pageable-content.interface';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { IBannerReturnView } from '@api/schemas/advertisement/banner-return-view.interface';
import { AdvertisementService } from '@api/routes/advertisement.service';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { BannerPlaceEnum } from '@api/schemas/advertisement/banner-place.enum';
import { IBannerCreateView } from '@api/schemas/advertisement/banner-create-view.interface';
import { CREATE_BANNER } from './create-banner.const';
import { SidebarWrapperService } from '@layout/sidebar-wrapper/sidebar-wrapper.service';

@Component({
  selector: 'app-ads-management-page',
  templateUrl: './ads-management-page.component.html',
  styleUrls: ['./ads-management-page.component.scss'],
})
export class AdsManagementPageComponent extends AbstractComponent implements OnInit, OnDestroy {
  public allBanners: IBannerPageableContent = {
    content: [],
    currentPage: 0,
    totalPages: 1,
    contentLoading: false,
  };

  public edit = false;
  public editBannerInfo$: BehaviorSubject<IBannerReturnView> = new BehaviorSubject<IBannerReturnView>(null);
  private sort = '';
  private query: string = null;
  public bannerSubject$ = new Subject<IBannerReturnView[]>();
  public creations: boolean;

  constructor(
    private readonly advertisementService: AdvertisementService,
    private readonly sidebarWrapperService: SidebarWrapperService
  ) {
    super(); }

  ngOnInit(): void {
    setTimeout(() => {
      this.sidebarWrapperService.params$.next({ article: false, trending: false, navigation: false, live: false, showSidebar: false });
    });
    this.fetchNextPage();
  }

  @HostListener('window:scroll', []) public onScroll(): void {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
      this.fetchNextPage();
    }
  }

  private fetchNextPage(): void {
    if ((this.allBanners.content === [] || this.allBanners.currentPage + 1 <= this.allBanners.totalPages) &&
        !this.allBanners.contentLoading) {
      this.allBanners.contentLoading = true;
      this.advertisementService.getAll$(
        this.allBanners.currentPage, null, this.sort !== '' ? this.sort : null, this.query ? this.query : null
      )
        .pipe(takeUntil(this.ngOnDestroy$))
        .subscribe((banners: IPageResponse<IBannerReturnView>) => {
          this.allBanners.content.push(...banners.content);
          this.allBanners.totalPages = banners.totalPages;
          this.allBanners.currentPage++;
          this.allBanners.contentLoading = false;
          this.bannerSubject$.next(this.allBanners.content);
        });
    }
  }

  public create(): void {
    const body: IBannerCreateView = CREATE_BANNER;
    this.advertisementService.post$(body).pipe(takeUntil(this.ngOnDestroy$)).subscribe((banner: IBannerReturnView) => {
      this.editBannerInfo$.next(banner);
      this.creations = true;
      this.edit = true;
    });
  }

  public save(id: number, body: IBannerCreateView): void {
    this.advertisementService.put$(id, body).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
      this.edit = false;
      this.clear();
    });
  }

  public savePicture(id: number, picture: File): void {
    this.advertisementService.updateImage$(id, picture).pipe(
      catchError(() => of(null)),
      takeUntil(this.ngOnDestroy$)
    ).subscribe((res: { url: string }) => {
      if (res !== null) {
        this.editBannerInfo$.next({
          ...this.editBannerInfo$.getValue(),
          picture: res.url
        });
      }
    });
  }

  public cancel(): void {
    if (this.creations) {
      const editBannerInfo = this.editBannerInfo$.getValue();
      this.advertisementService.delete$(editBannerInfo.id)
          .pipe(takeUntil(this.ngOnDestroy$))
          .subscribe(() => {
              this.allBanners.content = this.allBanners.content.filter((banner: IBannerReturnView) => banner.id !== editBannerInfo.id);
              this.bannerSubject$.next(this.allBanners.content);
          });
    }
    this.edit = false;
    this.editBannerInfo$.next(null);
    this.creations = null;
    this.clear();
  }

  public clear(): void {
    this.allBanners = { currentPage: 0, totalPages: 1, contentLoading: false, content: [] };
    this.fetchNextPage();
    window.scroll(0, 0);
  }

  public queryApply(q: string): void {
    this.query = q !== '' ? q : null;
    this.clear();
  }

  public sortApply(sort: string[]): void {
    this.sort = '';
    if (sort !== []) {
      sort.forEach((element: string) => {
        this.sort += element + ',';
      });
      this.sort = this.sort.slice(0, -1);
    }
    this.clear();
  }

  public setActive(id: number, active: boolean): void {
    this.advertisementService.getById$(id).pipe(
      switchMap((_: IBannerReturnView) => this.advertisementService.put$(id, { ...(_ as IBannerCreateView), active })),
      tap(() => this.allBanners.content.filter((banner: IBannerReturnView) => banner.id === id)[0].active = active),
      takeUntil(this.ngOnDestroy$)
    ).subscribe(() => this.bannerSubject$.next(this.allBanners.content));
  }

  public setPlace(id: number, place: BannerPlaceEnum): void {
    this.advertisementService.getById$(id).pipe(
      switchMap((_: IBannerReturnView) => this.advertisementService.put$(id, { ...(_ as IBannerCreateView), place })),
      tap(() => this.savePicture(id, null)),
      takeUntil(this.ngOnDestroy$)
    ).subscribe();
  }

  public editBanner(id: number): void {
    this.advertisementService.getById$(id)
        .pipe(takeUntil(this.ngOnDestroy$))
        .subscribe((banner: IBannerReturnView) => {
      this.editBannerInfo$.next({ ...banner, id });
      this.edit = true;
      this.creations = false;
    });
  }

  public delete(id: number): void {
    this.advertisementService.delete$(id)
      .pipe(takeUntil(this.ngOnDestroy$))
      .subscribe(() => {
        this.allBanners.content = this.allBanners.content.filter((banner: IBannerReturnView) => banner.id !== id);
        this.bannerSubject$.next(this.allBanners.content);
    });
  }

  public parseReq(req: [number, string, boolean?]): void {
    switch (req[1]) {
      case 'delete':
        this.delete(req[0]);
        break;
      case 'active':
        this.setActive(req[0], req[2]);
        break;
      case 'edit':
        this.editBanner(req[0]);
        break;
      default:
        break;
    }
  }
}

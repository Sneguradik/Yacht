import { Component, OnInit, OnDestroy } from '@angular/core';
import { PermissionService } from '@app/services/permission/permission.service';
import { ResponsiveService } from '@app/services/responsive.service';
import { SessionService } from '@app/services/session.service';
import { IShowcaseView } from '@api/schemas/showcase/showcase-view.interface';
import { ShowcasesService } from '@api/routes/showcases.service';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { takeUntil } from 'rxjs/operators';
import { ShowcaseEditBlockService } from './showcase-edit-block.service';

@Component({
  selector: 'app-live-content',
  templateUrl: './live-content.component.html',
  styleUrls: ['./live-content.component.scss']
})
export class LiveContentComponent extends AbstractComponent implements OnInit, OnDestroy {
  public items: IShowcaseView[] = [];
  public currentPage = -1;
  public totalPages = 1;
  public isLoading = false;

  constructor(
    private readonly showcaseService: ShowcasesService,
    private readonly sessionService: SessionService,
    private readonly showcaseEditBlockService: ShowcaseEditBlockService,
    public readonly perms: PermissionService,
    public readonly responsive: ResponsiveService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.fetchNextPage();
    this.showcaseEditBlockService.refresh$.pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
      this.items = [];
      this.currentPage = -1;
      this.fetchNextPage();
    });
  }

  public fetchNextPage(): void {
    if (!this.isLoading && this.currentPage < this.totalPages - 1) {
      this.isLoading = true;
      this.currentPage += 1;
      this.showcaseService.get$(this.currentPage).pipe(takeUntil(this.ngOnDestroy$)).subscribe((response: IPageResponse<IShowcaseView>) => {
        this.totalPages = response.totalPages;
        this.items.push(...response.content);
        this.isLoading = false;
        this.items.sort((_: IShowcaseView, __: IShowcaseView) => (_.views.you ? 1 : -1) - (__.views.you ? 1 : -1));
        if (this.currentPage < this.totalPages) {
          this.fetchNextPage();
        }
      });
    }
  }

  public open(item: IShowcaseView): void {
    if (this.sessionService.loggedIn$.value) {
      this.showcaseService.storeView$(item.meta.id).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
        item.views.you = true;
      });
    }
    window.open(item.info.url, '_blank');
  }

  public withdraw(item: IShowcaseView): void {
    this.showcaseService.withdraw$(item.meta.id).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
      this.items.splice(this.items.indexOf(item), 1);
    });
  }
}

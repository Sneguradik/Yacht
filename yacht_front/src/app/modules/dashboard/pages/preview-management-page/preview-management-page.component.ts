import { Component, OnInit, OnDestroy } from '@angular/core';
import { AdministrationService } from '@api/routes/administration.service';
import { IPreviewManagementView } from '@api/schemas/dashboard/preview-management-view.interface';
import { IUploadImageResponse } from '@api/schemas/image/upload-image-response.interface';
import { IPreviewManagementCreate } from '@api/schemas/dashboard/preview-management-create.interface';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { takeUntil } from 'rxjs/operators';
import { SidebarWrapperService } from '@layout/sidebar-wrapper/sidebar-wrapper.service';

@Component({
  selector: 'app-preview-management-page',
  templateUrl: './preview-management-page.component.html',
  styleUrls: ['./preview-management-page.component.scss']
})
export class PreviewManagementPageComponent extends AbstractComponent implements OnInit, OnDestroy {
  public data: IPreviewManagementView;
  public saved = false;

  constructor(
    private readonly administrationService: AdministrationService,
    private readonly sidebarWrapperService: SidebarWrapperService
  ) { super(); }

  ngOnInit(): void {
    setTimeout(() => {
      this.sidebarWrapperService.params$.next({ article: false, trending: false, navigation: false, live: false, showSidebar: false });
    });
    this.administrationService.getPreview$().pipe(takeUntil(this.ngOnDestroy$)).subscribe((_: IPreviewManagementView) => {
      this.data = _;
    });
  }

  public putCover(image: File, data: IPreviewManagementCreate): void {
    this.administrationService.putPreviewCover$(image).pipe(takeUntil(this.ngOnDestroy$)).subscribe((_: IUploadImageResponse) => {
      this.data = { ...this.data, ...data, image: _.url };
    });
  }

  public putContent(data: IPreviewManagementCreate): void {
    this.administrationService.putPreviewContent$(data).pipe(takeUntil(this.ngOnDestroy$)).subscribe((_: IPreviewManagementView) => {
      this.data = _;
      this.saved = true;
      setTimeout(() => {
        this.saved = false;
      }, 5000);
    });
  }
}

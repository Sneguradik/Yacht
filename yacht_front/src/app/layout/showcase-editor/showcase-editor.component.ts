import { Component, OnInit, OnDestroy } from '@angular/core';
import { IShowcaseView } from '@api/schemas/showcase/showcase-view.interface';
import { Observable } from 'rxjs';
import { ShowcaseEditBlockService } from '@layout/sidebar-wrapper/live-content/showcase-edit-block.service';
import { ShowcasesService } from '@api/routes/showcases.service';
import { Router } from '@angular/router';
import { ResponsiveService } from '@app/services/responsive.service';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { IUploadImageResponse } from '@api/schemas/image/upload-image-response.interface';
import { IShowcasePatch } from '@api/schemas/showcase/showcase-patch.interface';
import { switchMap, takeUntil, tap, filter } from 'rxjs/operators';
import { AbstractComponent } from '@shared/classes/abstract-component.class';

@Component({
  selector: 'app-showcase-editor',
  templateUrl: './showcase-editor.component.html',
  styleUrls: ['./showcase-editor.component.scss']
})
export class ShowcaseEditorComponent extends AbstractComponent implements OnInit, OnDestroy {
  public id: number = null;
  public item: IShowcaseView = null;
  public count = -1;
  public item$: Observable<IShowcaseView>;

  constructor(
    private readonly showcasesService: ShowcasesService,
    private readonly router: Router,
    public readonly responsive: ResponsiveService,
    public readonly showcaseEditBlockService: ShowcaseEditBlockService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.showcaseEditBlockService.getId$().pipe(
      tap((_: number) => this.id = _),
      filter((_: number) => _ !== -1),
      switchMap((_: number) => this.showcasesService.getSingle$(this.id)),
      takeUntil(this.ngOnDestroy$)
    ).subscribe((item: IShowcaseView) => this.item = item);
    this.showcasesService.get$().pipe(takeUntil(this.ngOnDestroy$)).subscribe((_: IPageResponse<IShowcaseView>) => {
      this.count = _.total + 1;
    });
  }

  public uploadCover(cover: File): void {
    this.showcasesService.updateCover$(this.id, cover).pipe(takeUntil(this.ngOnDestroy$)).subscribe((url: IUploadImageResponse) => {
      this.item.info.cover = url.url;
    });
  }

  public publish(): void {
    const data: IShowcasePatch = {
      info: {
        url: this.item.info.url,
        title: this.item.info.title,
        subtitle: this.item.info.subtitle,
      },
    };
    this.showcasesService.patch$(this.id, data).pipe(
      switchMap(() => this.showcasesService.publish$(this.id)),
      takeUntil(this.ngOnDestroy$)
    ).subscribe(() => {
      this.showcaseEditBlockService.refresh$.next();
      this.showcaseEditBlockService.toggle();
      this.router.navigate(['/all']);
    });
  }
}

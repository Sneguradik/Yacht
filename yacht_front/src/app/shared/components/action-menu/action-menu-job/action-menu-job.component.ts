import { Component, EventEmitter, Input, Output, OnDestroy } from '@angular/core';
import { ShowcasesService } from '@api/routes/showcases.service';
import { IJobView } from '@api/schemas/job/job-view.interface';
import { switchMap, takeUntil } from 'rxjs/operators';
import { JobsService } from '@api/routes/jobs.service';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { PublicationStageEnum } from '@api/schemas/article/publication-stage.enum';
import { ICreatedObject } from '@api/schemas/object/created-object.interface';
import { ReportEntityTypeEnum } from '@api/schemas/report/report-entity-type.enum';

@Component({
  selector: 'app-action-menu-job',
  templateUrl: './action-menu-job.component.html',
  styleUrls: ['./action-menu-job.component.scss'],
})
export class ActionMenuJobComponent extends AbstractComponent implements OnDestroy {
  @Input() public data: IJobView;
  @Input() public own: boolean;

  @Output() public readonly gone: EventEmitter<IJobView> = new EventEmitter<IJobView>();

  public readonly publicationStageEnum: typeof PublicationStageEnum = PublicationStageEnum;
  public readonly reportEntityTypeEnum: typeof ReportEntityTypeEnum = ReportEntityTypeEnum;

  constructor(
    private readonly jobsService: JobsService,
    private readonly showcasesService: ShowcasesService
  ) { super(); }

  public delete(): void {
    const d = this.data;
    this.jobsService.delete$(d.meta.id).subscribe(() => this.gone.next(d));
  }

  public showcase(): void {
    this.jobsService.showcase$(this.data.meta.id).pipe(
      switchMap((obj: ICreatedObject) => this.showcasesService.navigate$(obj)),
      takeUntil(this.ngOnDestroy$)
    ).subscribe();
  }

  public hide(): void {
    const d = this.data;
    this.jobsService.hide$(d.meta.id, d.hidden).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
      d.hidden = !d.hidden;
      if (d.hidden) {
        this.gone.next(d);
      }
    });
  }

  public publish(): void {
    this.jobsService.publish$(this.data.meta.id).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
      this.data.info.publicationStage = PublicationStageEnum.PUBLISHED;
    });
  }

  public withdraw(): void {
    this.jobsService.withdraw$(this.data.meta.id).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
      this.data.info.publicationStage = PublicationStageEnum.DRAFT;
    });
  }
}

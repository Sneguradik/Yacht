import { Component, EventEmitter, Input, Output, OnDestroy } from '@angular/core';
import { ShowcasesService } from '@api/routes/showcases.service';
import { IEventView } from '@api/schemas/event/event-view.interface';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { switchMap, takeUntil } from 'rxjs/operators';
import { EventsService } from '@api/routes/events.service';
import { ICreatedObject } from '@api/schemas/object/created-object.interface';
import { PublicationStageEnum } from '@api/schemas/article/publication-stage.enum';
import { ReportEntityTypeEnum } from '@api/schemas/report/report-entity-type.enum';

@Component({
  selector: 'app-action-menu-event',
  templateUrl: './action-menu-event.component.html',
  styleUrls: ['./action-menu-event.component.scss'],
})
export class ActionMenuEventComponent extends AbstractComponent implements OnDestroy {
  @Input() public data: IEventView;
  @Input() public own: boolean;

  @Output() public readonly gone: EventEmitter<IEventView> = new EventEmitter<IEventView>();

  public readonly publicationStageEnum: typeof PublicationStageEnum = PublicationStageEnum;
  public readonly reportEntityTypeEnum: typeof ReportEntityTypeEnum = ReportEntityTypeEnum;

  constructor(
    private readonly eventsService: EventsService,
    private readonly showcasesService: ShowcasesService
  ) { super(); }

  public delete(): void {
    const d = this.data;
    this.eventsService.delete$(d.meta.id).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => this.gone.next(d));
  }

  public showcase(): void {
    this.eventsService.showcase$(this.data.meta.id).pipe(
      switchMap((_: ICreatedObject) => this.showcasesService.navigate$(_)),
      takeUntil(this.ngOnDestroy$)
    ).subscribe();
  }

  public hide(): void {
    const d = this.data;
    this.eventsService.hide$(d.meta.id, d.hidden).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
      d.hidden = !d.hidden;
      if (d.hidden) { this.gone.next(d); }
    });
  }

  public publish(): void {
    this.eventsService.publish$(this.data.meta.id).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
      this.data.info.publicationStage = PublicationStageEnum.PUBLISHED;
    });
  }

  public withdraw(): void {
    this.eventsService.withdraw$(this.data.meta.id).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
      this.data.info.publicationStage = PublicationStageEnum.DRAFT;
    });
  }
}

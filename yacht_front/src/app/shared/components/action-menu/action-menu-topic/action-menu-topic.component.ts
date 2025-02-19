import { Component, EventEmitter, Input, Output, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { ITopicView } from '@api/schemas/topic/topic-view.interface';
import { TopicsService } from '@api/routes/topics.service';
import { ShowcasesService } from '@api/routes/showcases.service';
import { ICreatedObject } from '@api/schemas/object/created-object.interface';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { ReportEntityTypeEnum } from '@api/schemas/report/report-entity-type.enum';

@Component({
  selector: 'app-action-menu-topic',
  templateUrl: './action-menu-topic.component.html',
  styleUrls: ['./action-menu-topic.component.scss'],
})
export class ActionMenuTopicComponent extends AbstractComponent implements OnDestroy {
  @Input() public data: ITopicView;

  @Output() public readonly gone: EventEmitter<ITopicView> = new EventEmitter<ITopicView>();

  public readonly reportEntityTypeEnum: typeof ReportEntityTypeEnum = ReportEntityTypeEnum;

  constructor(
    private readonly router: Router,
    private readonly topicsService: TopicsService,
    private readonly showcasesService: ShowcasesService
  ) {
    super();
  }

  public hide(): void {
    const d = this.data;
    forkJoin([this.topicsService.subscribe$(d.meta.id, true), this.topicsService.hide$(d.meta.id, d.hidden)])
      .pipe(takeUntil(this.ngOnDestroy$))
      .subscribe(() => {
        d.hidden = !d.hidden;
        if (d.hidden) {
          this.gone.next(d);
        }
    });
  }

  public showcase(): void {
    this.topicsService.showcase$(this.data.meta.id).pipe(
      switchMap((_: ICreatedObject) => this.showcasesService.navigate$(_)),
      takeUntil(this.ngOnDestroy$)
    ).subscribe();
  }

  public edit(): void {
    this.router.navigate(['/topics', this.data.meta.id, 'edit']);
  }
}

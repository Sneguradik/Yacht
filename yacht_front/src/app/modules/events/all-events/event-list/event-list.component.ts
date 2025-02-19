import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, Subject, throwError, Observable } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { EventFiltersEnum } from '@api/schemas/event/event-filters.enum';
import { IEventQuery } from '@api/schemas/event/event-query.interface';
import { IEventView } from '@api/schemas/event/event-view.interface';
import { PageableContent, NO_CONTENT } from '@shared/classes/pageable-conetnt.class';
import { IUserViewFull } from '@api/schemas/user/user-view-full.interface';
import { SessionService } from '@app/services/session.service';
import { PublicationStageEnum } from '@api/schemas/article/publication-stage.enum';
import { eventFilters } from './event-filters.const';
import { IToggleItem } from '@shared/interfaces/toggle-item.interface';
import { EventsService } from '@api/routes/events.service';
import { IPageResponse } from '@api/schemas/page/page-response.interface';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss'],
})
export class EventListComponent extends AbstractComponent implements OnInit, OnDestroy {
  private readonly onRangeOrFilter$: Subject<void> = new Subject();
  private readonly selectedFilter$: BehaviorSubject<EventFiltersEnum> = new BehaviorSubject<EventFiltersEnum>(null);

  public readonly EVENT_FILTERS: IToggleItem<EventFiltersEnum, IEventQuery>[] = eventFilters(this.translateService);
  public readonly pageable: PageableContent<IEventView, [IUserViewFull, EventFiltersEnum]> =
    new PageableContent<IEventView, [IUserViewFull, EventFiltersEnum]>(this.fetchPageFn$.bind(this), null);

  public events: IEventView[] = [];
  public filters = this.EVENT_FILTERS;

  constructor(
    private sessionService: SessionService,
    private eventsService: EventsService,
    private readonly translateService: TranslateService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.pageable.content$.pipe(takeUntil(this.ngOnDestroy$)).subscribe((content: IEventView[]) => {
      this.events.push(...content);
    });
    combineLatest([this.sessionService.user$, this.selectedFilter$])
      .pipe(
        tap((options: [IUserViewFull, EventFiltersEnum]) => {
          this.events.splice(0, this.events.length);
          this.pageable.options$.next(options);
        }),
        switchMap(() => this.pageable.reset$()),
        takeUntil(this.ngOnDestroy$),
      )
      .subscribe(() => {
        this.pageable.fetch();
      });
  }

  private fetchPageFn$(page: number, options: [IUserViewFull, EventFiltersEnum] | null): Observable<IPageResponse<IEventView>> {
    if (options === null) {
      return throwError(NO_CONTENT);
    }
    return this.eventsService.get$(page, {
      stages: [PublicationStageEnum.PUBLISHED],
      types: options[1] ? [Object.keys(EventFiltersEnum).map((key: string) => EventFiltersEnum[key as any])[options[1]] as any] : [],
      after: Date.now(),
    });
  }

  public filterEvent(filter: IToggleItem<EventFiltersEnum>): void {
    this.selectedFilter$.next(filter.data);
    this.onRangeOrFilter$.next();
  }

  public rangeEvent(): void {
    this.onRangeOrFilter$.next();
  }

  public remove(event: IEventView): void {
    this.events.splice(this.events.indexOf(event), 1);
  }
}

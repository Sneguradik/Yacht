import { Component, OnInit, OnDestroy } from '@angular/core';
import { eventFilters } from './event-filters.function';
import { IEventView } from '@api/schemas/event/event-view.interface';
import { PageableContent, NO_CONTENT } from '@shared/classes/pageable-conetnt.class';
import { IUserViewFull } from '@api/schemas/user/user-view-full.interface';
import { EventFiltersEnum } from '@api/schemas/event/event-filters.enum';
import { BehaviorSubject, Observable, combineLatest, throwError } from 'rxjs';
import { IToggleItem } from '@shared/interfaces/toggle-item.interface';
import { IEventQuery } from '@api/schemas/event/event-query.interface';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { takeUntil, map, tap, switchMap } from 'rxjs/operators';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { UsersService } from '@api/routes/users.service';
import { SessionService } from '@app/services/session.service';
import { CompaniesService } from '@api/routes/companies.service';
import { TranslateService } from '@ngx-translate/core';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { PublicationStageEnum } from '@api/schemas/article/publication-stage.enum';
import { PermissionService } from '@app/services/permission/permission.service';
import { SidebarWrapperService } from '@layout/sidebar-wrapper/sidebar-wrapper.service';

@Component({
  selector: 'app-user-events-page',
  templateUrl: './user-events-page.component.html',
  styleUrls: ['./user-events-page.component.scss']
})
export class UserEventsPageComponent extends AbstractComponent implements OnInit, OnDestroy {
  public readonly activeFilter$: BehaviorSubject<EventFiltersEnum> = new BehaviorSubject<EventFiltersEnum>(null);
  public readonly filters: IToggleItem<EventFiltersEnum, IEventQuery>[] = eventFilters(this.translateService);

  public currentEvents: IEventView[] = [];
  public pageable: PageableContent<IEventView, [number, IUserViewFull, EventFiltersEnum]> =
    new PageableContent<IEventView, [number, IUserViewFull, EventFiltersEnum]>(this.fetchPageFn$.bind(this), null);
  public id$: Observable<number>;

  constructor(
    private readonly usersService: UsersService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly sessionService: SessionService,
    private readonly companiesService: CompaniesService,
    private readonly permissionService: PermissionService,
    private readonly translateService: TranslateService,
    private readonly sidebarWrapperService: SidebarWrapperService
  ) {
    super();
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.sidebarWrapperService.params$.next({ article: false, trending: true, navigation: true, live: false, showSidebar: true });
    });

    this.id$ = this.activatedRoute.paramMap.pipe(
      map((paramMap: ParamMap) => {
        const id = paramMap.get('id');
        return /^\d+$/.test(id) ? parseInt(id, 10) : id;
      }),
      switchMap((id: string | number) => this.usersService.getSingle$(id)),
      map((user: IUserViewFull) => user.meta.id)
    );

    this.pageable.content$.pipe(takeUntil(this.ngOnDestroy$)).subscribe((content: IEventView[]) => {
      this.currentEvents.push(...content);
    });
    combineLatest([this.id$, this.sessionService.user$, this.activeFilter$]).pipe(
      tap((options: [number, IUserViewFull, EventFiltersEnum]) => {
        this.currentEvents.splice(0, this.currentEvents.length);
        this.pageable.options$.next(options);
      }),
      switchMap(() => this.pageable.reset$()),
      takeUntil(this.ngOnDestroy$),
    ).subscribe(() => {
      this.pageable.fetch();
    });
  }

  private fetchPageFn$(page: number, options: [number, IUserViewFull, EventFiltersEnum] | null): Observable<IPageResponse<IEventView>> {
    if (options === null) {
      return throwError(NO_CONTENT);
    }
    const canSeeDrafts = options[1] !== null && (options[1].meta.id === options[0] || this.permissionService.hasAnyRole(options[1], 'EDITOR$'));
    return this.companiesService.events$(options[0], page, {
      stages: canSeeDrafts ? [PublicationStageEnum.DRAFT, PublicationStageEnum.REVIEWING,
        PublicationStageEnum.PUBLISHED, PublicationStageEnum.BLOCKED] : [PublicationStageEnum.PUBLISHED],
      types: options[2] ? [EventFiltersEnum[options[2]] as any] : [],
    });
  }

  public remove(event: IEventView): void {
    this.currentEvents.splice(this.currentEvents.findIndex((it: IEventView) => it === event), 1);
  }

  public filterEvent(filter: IToggleItem<EventFiltersEnum>): void {
    this.activeFilter$.next(filter.data);
  }
}

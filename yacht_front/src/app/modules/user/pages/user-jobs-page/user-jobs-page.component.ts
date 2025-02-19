import { Component, OnInit, OnDestroy } from '@angular/core';
import { IJobView } from '@api/schemas/job/job-view.interface';
import { PageableContent, NO_CONTENT } from '@shared/classes/pageable-conetnt.class';
import { IUserViewFull } from '@api/schemas/user/user-view-full.interface';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { Observable, combineLatest, throwError } from 'rxjs';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { takeUntil, map, tap, switchMap } from 'rxjs/operators';
import { SessionService } from '@app/services/session.service';
import { UsersService } from '@api/routes/users.service';
import { CompaniesService } from '@api/routes/companies.service';
import { EventFiltersEnum } from '@api/schemas/event/event-filters.enum';
import { PublicationStageEnum } from '@api/schemas/article/publication-stage.enum';
import { PermissionService } from '@app/services/permission/permission.service';
import { SidebarWrapperService } from '@layout/sidebar-wrapper/sidebar-wrapper.service';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { JobOrderEnum } from '@api/schemas/job/job-order.enum';

@Component({
  selector: 'app-user-jobs-page',
  templateUrl: './user-jobs-page.component.html',
  styleUrls: ['./user-jobs-page.component.scss']
})
export class UserJobsPageComponent extends AbstractComponent implements OnInit, OnDestroy {
  public readonly pageable: PageableContent<IJobView, [number, IUserViewFull]> =
    new PageableContent<IJobView, [number, IUserViewFull]>(this.fetchPageFn$.bind(this), null);

  public jobs: IJobView[] = [];
  public id$: Observable<number>;

  constructor(
    private readonly usersService: UsersService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly sessionService: SessionService,
    private readonly companiesService: CompaniesService,
    private readonly permissionService: PermissionService,
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

    this.pageable.content$.pipe(takeUntil(this.ngOnDestroy$)).subscribe((content: IJobView[]) => {
      this.jobs.push(...content);
    });
    combineLatest([this.id$, this.sessionService.user$]).pipe(
      tap((options: [number, IUserViewFull]) => {
        this.jobs.splice(0, this.jobs.length);
        this.pageable.options$.next(options);
      }),
      switchMap(() => this.pageable.reset$()),
      takeUntil(this.ngOnDestroy$),
    ).subscribe(() => {
      this.pageable.fetch();
    });
  }

  private fetchPageFn$(page: number, options: [number, IUserViewFull, EventFiltersEnum] | null): Observable<IPageResponse<IJobView>> {
    if (options === null) {
      return throwError(NO_CONTENT);
    }
    const canSeeDrafts: boolean = options[1] !== null && (options[1].meta.id === options[0] || this.permissionService.hasAnyRole(options[1], 'EDITOR$'));
    return this.companiesService.jobs$(options[0], page, {
      order: JobOrderEnum.LAST_POST_TIME,
      stages: canSeeDrafts
        ? [
            PublicationStageEnum.DRAFT,
            PublicationStageEnum.REVIEWING,
            PublicationStageEnum.PUBLISHED,
            PublicationStageEnum.BLOCKED
        ]
        : [PublicationStageEnum.PUBLISHED],
    });
  }

  public remove(job: IJobView): void {
    this.jobs.splice(this.jobs.findIndex((it: IJobView) => it === job), 1);
  }
}

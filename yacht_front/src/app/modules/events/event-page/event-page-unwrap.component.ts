import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CompaniesService } from '@api/routes/companies.service';
import { ICompanyViewFull } from '@api/schemas/company/company-view-full.interface';
import { SessionService } from '@app/services/session.service';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { Observable } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { IEventViewFull } from '@api/schemas/event/event-view-full.interface';
import { EventsService } from '@api/routes/events.service';
import { IUserViewFull } from '@api/schemas/user/user-view-full.interface';
import { DynamicMetaTagsService } from '@layout/dynamic-meta-tags/dynamic-meta-tags.service';
import { environment } from '@env';
import { SidebarWrapperService } from '@layout/sidebar-wrapper/sidebar-wrapper.service';

@Component({
  selector: 'app-event-page-unwrap',
  template: '<app-event-page [event]="event" [own]="own$ | async" [company]="company$ | async"></app-event-page>',
  // tslint:disable-next-line:no-host-metadata-property
  host: { style: 'width: 100%' }
})
export class EventPageUnwrapComponent extends AbstractComponent implements OnInit, OnDestroy  {
  public event: IEventViewFull;
  public own$: Observable<boolean>;
  public company$: Observable<ICompanyViewFull>;

  constructor(
    private readonly eventsService: EventsService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly sessionService: SessionService,
    private readonly companyService: CompaniesService,
    private readonly sidebarWrapperService: SidebarWrapperService,
    private readonly dynamicMetaTagsService: DynamicMetaTagsService,
    private readonly router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.sidebarWrapperService.params$.next({ article: false, trending: true, navigation: true, live: false, showSidebar: true });
    });

    this.event = this.activatedRoute.snapshot.data.data;
    this.setPreInfo();
    this.company$ = this.companyService.getSingle$(this.event.company.meta.id);
    this.own$ = this.sessionService.user$.pipe(map((user: IUserViewFull) => user && this.event.company.meta.id === user.meta.id));
    this.eventsService.view$(this.event.meta.id).pipe(takeUntil(this.ngOnDestroy$)).subscribe();
  }

  ngOnDestroy(): void {
    this.dynamicMetaTagsService.setToDefault();
    super.ngOnDestroy();
  }

  private setPreInfo(): void {
    this.dynamicMetaTagsService.metaInfo$.next({
      title: this.event.info.name,
      tags: [
        { property: 'og:title', content: this.event.info.name },
        { name: 'description', content: this.event.info.announcement },
        { property: 'og:description', content: this.event.info.announcement },
        { property: 'og:url', content: environment.url + this.router.url },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Diskurs.Media' },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: this.event.info.name },
        { name: 'twitter:description', content: this.event.info.announcement },
      ]
    });
  }
}

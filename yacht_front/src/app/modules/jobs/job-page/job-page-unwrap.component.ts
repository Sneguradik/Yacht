import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CompaniesService } from '@api/routes/companies.service';
import { ICompanyViewFull } from '@api/schemas/company/company-view-full.interface';
import { IJobViewFull } from '@api/schemas/job/job-view-full.interface';
import { SessionService } from '@app/services/session.service';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { Observable } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { JobsService } from '@api/routes/jobs.service';
import { IUserViewFull } from '@api/schemas/user/user-view-full.interface';
import { DynamicMetaTagsService } from '@layout/dynamic-meta-tags/dynamic-meta-tags.service';
import { environment } from '@env';
import { SidebarWrapperService } from '@layout/sidebar-wrapper/sidebar-wrapper.service';

@Component({
  selector: 'app-job-page-unwrap',
  templateUrl: 'app-job-page-unwrap.html',
  styleUrls: ['./app-job-page-unwrap.scss'],
  host: { style: 'width: 100%' }
})
export class JobPageUnwrapComponent extends AbstractComponent implements OnInit, OnDestroy {
  public job: IJobViewFull;
  public own$: Observable<boolean>;
  public company$: Observable<ICompanyViewFull>;

  constructor(
    private readonly jobsService: JobsService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly sessionService: SessionService,
    private readonly companyService: CompaniesService,
    private readonly dynamicMetaTagsService: DynamicMetaTagsService,
    private readonly router: Router,
    private readonly sidebarWrapperService: SidebarWrapperService
  ) {
    super();
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.sidebarWrapperService.params$.next({ article: false, trending: true, navigation: true, live: false, showSidebar: true });
    });
    this.job = this.activatedRoute.snapshot.data.data;
    this.setPreInfo();
    this.company$ = this.companyService.getSingle$(this.job.company.meta.id);
    this.own$ = this.sessionService.user$.pipe(
      map((user: IUserViewFull) => user && this.job.company.meta.id === user.meta.id)
    );
    this.jobsService.view$(this.job.meta.id).pipe(takeUntil(this.ngOnDestroy$)).subscribe();
  }

  ngOnDestroy(): void {
    this.dynamicMetaTagsService.setToDefault();
    super.ngOnDestroy();
  }

  private setPreInfo(): void {
    this.dynamicMetaTagsService.metaInfo$.next({
      title: this.job.info.name,
      tags: [
        { property: 'og:title', content: this.job.info.name },
        {
          name: 'description',
          content: this.job.body.requirements
            ? this.job.body.requirements
            : 'Вакансия на Diskurs.Media'
        },
        {
          property: 'og:description',
          content: this.job.body.requirements
            ? this.job.body.requirements
            : 'Вакансия на Diskurs.Media'
        },
        { property: 'og:url', content: environment.url + this.router.url },
        { property: 'og:image', content: this.job.body.image },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Diskurs.Media' },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: this.job.info.name },
        {
          name: 'twitter:description',
          content: this.job.body.requirements
            ? this.job.body.requirements
            : 'Вакансия на Diskurs.Media'
        },
        { name: 'twitter:image', content: this.job.body.image }
      ]
    });
  }
}

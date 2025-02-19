import { ChangeDetectorRef, Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ICompanyViewFull } from '@api/schemas/company/company-view-full.interface';
import { IJobViewFull } from '@api/schemas/job/job-view-full.interface';
import { SessionService } from '@app/services/session.service';
import { UserDropdownService } from '@layout/shared/services/user-dropdown.service';
import { formatMoney } from '@shared/utils/money-format';
import { JobsService } from '@api/routes/jobs.service';
import { JobCurrencyEnum } from '@api/schemas/job/job-currency.enum';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { takeUntil } from 'rxjs/operators';
import { PublicationStageEnum } from '@api/schemas/article/publication-stage.enum';
import { TranslateService } from '@ngx-translate/core';
import { SidebarWrapperService } from '@layout/sidebar-wrapper/sidebar-wrapper.service';


@Component({
  selector: 'app-job-page',
  templateUrl: './job-page.component.html',
  styleUrls: ['./job-page.component.scss'],
})
export class JobPageComponent extends AbstractComponent implements OnInit, OnDestroy {
  @Input() public job: IJobViewFull;
  @Input() public company: ICompanyViewFull;
  @Input() public own: boolean;

  public readonly publicationStageEnum: typeof PublicationStageEnum = PublicationStageEnum;

  public contactsRevealed = false;

  public share: boolean;
  public shareBody: string;
  public linkVk: string;
  public linkFb: string;
  public linkTw: string;
  public linkIn: string;
  public linkTg: string;

  public get salary(): string {
    const result = [];
    if (this.job.info.minSalary) {
      result.push(this.translateService.instant('COMMON.FROM'),
        formatMoney(+this.job.info.minSalary, JobCurrencyEnum[this.job.info.currency]));
    }
    if (this.job.info.maxSalary) {
      result.push(this.translateService.instant('COMMON.TO'),
        formatMoney(+this.job.info.maxSalary, JobCurrencyEnum[this.job.info.currency]));
    }

    return result.join(' ');
  }

  constructor(
    protected readonly translateService: TranslateService,
    private readonly jobsService: JobsService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly sessionService: SessionService,
    private readonly sidebarWrapperService: SidebarWrapperService,
    public readonly router: Router,
    public readonly userDropdown: UserDropdownService,
  ) { super(); }

  ngOnInit(): void {
    setTimeout(() => {
      this.sidebarWrapperService.params$.next({ article: false, trending: true, navigation: true, live: false, showSidebar: true });
    });

    this.shareBody = 'https://ru.yachtsmanjournal.com' + this.router.url;
    this.linkVk = 'https://vk.com/share.php?url=' + this.shareBody;
    this.linkFb = 'https://www.facebook.com/sharer/sharer.php?u=' + this.shareBody;
    this.linkTw = 'https://twitter.com/intent/tweet?url=' + this.shareBody;
    this.linkIn = 'https://vk.com/share.php?url=' + this.shareBody;
    this.linkTg = 'tg://msg_url?url=' + this.shareBody;
  }

  public goTo(url: string): void {
    window.open(url, '_blank');
  }

  public toggleShare(): void {
    this.share = !this.share;
  }

  public bookmark(): void {
    if (this.sessionService.loggedIn$.value) {
      this.jobsService.bookmark$(this.job.meta.id, this.job.bookmarks.you).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
        this.job.bookmarks.you = !this.job.bookmarks.you;
        this.job.bookmarks.count += this.job.bookmarks.you ? 1 : -1;
        this.changeDetectorRef.markForCheck();
      });
    } else {
      this.userDropdown.setShowDropdown(true);
    }
  }
}

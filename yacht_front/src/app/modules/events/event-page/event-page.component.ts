import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ICompanyViewFull } from '@api/schemas/company/company-view-full.interface';
import { EventCurrencyEnum } from '@api/schemas/event/event-currency.enum';
import { SessionService } from '@app/services/session.service';
import { UserDropdownService } from '@layout/shared/services/user-dropdown.service';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { } from 'angular8-yandex-maps';
import { takeUntil } from 'rxjs/operators';
import { IEventViewFull } from '@api/schemas/event/event-view-full.interface';
import { EventsService } from '@api/routes/events.service';
import { PublicationStageEnum } from '@api/schemas/article/publication-stage.enum';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-event-page',
  templateUrl: './event-page.component.html',
  styleUrls: ['./event-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventPageComponent extends AbstractComponent implements OnInit, OnDestroy {
  @Input() public event: IEventViewFull;
  @Input() public company: ICompanyViewFull;
  @Input() public own: boolean;

  public readonly publicationStageEnum: typeof PublicationStageEnum = PublicationStageEnum;

  public share: boolean;
  public shareBody: string;
  public linkVk: string;
  public linkFb: string;
  public linkTw: string;
  public linkIn: string;
  public linkTg: string;

  public pipeLng: string = this.translateService.currentLang === 'ru' ? 'ru_RU' : 'en_US';

  public get price(): string {
    switch (this.event.info.currency) {
      case EventCurrencyEnum.FREE:
        return this.translateService.instant('COMMON.FREE');
      case EventCurrencyEnum.EUR:
        return this.event.info.price ? `€${this.event.info.price}` : null;
      case EventCurrencyEnum.USD:
        return this.event.info.price ? `$${this.event.info.price}` : null;
      case EventCurrencyEnum.RUB:
        return this.event.info.price ? `${this.event.info.price} ₽` : null;
      case EventCurrencyEnum.NONE:
        return null;
    }
  }

  public get dateWithTime(): boolean {
    return (this.event.info.date % 10) === 0;
  }

  constructor(
    private readonly eventsService: EventsService,
    private readonly sessionService: SessionService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly translateService: TranslateService,
    public readonly router: Router,
    public readonly userDropdown: UserDropdownService,
  ) {
    super();
  }

  ngOnInit(): void {
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

  public bookmark(): void {
    if (this.sessionService.loggedIn$.value) {
      this.eventsService.bookmark$(this.event.meta.id, this.event.bookmarks.you).pipe(takeUntil(this.ngOnDestroy$))
        .subscribe(() => {
          this.event.bookmarks.you = !this.event.bookmarks.you;
          this.event.bookmarks.count += this.event.bookmarks.you ? 1 : -1;
          this.changeDetectorRef.markForCheck();
        });
    } else {
      this.userDropdown.setShowDropdown(true);
    }
  }

  public toggleShare(): void {
    this.share = !this.share;
  }
}

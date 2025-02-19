import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { IEventView } from '@api/schemas/event/event-view.interface';
import { SessionService } from '@app/services/session.service';
import { EventsService } from '@api/routes/events.service';
import { UserDropdownService } from '@layout/shared/services/user-dropdown.service';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
})
export class EventsComponent extends AbstractComponent implements OnInit, OnDestroy {
  @Input() public blueClass: string;
  @Input() public feedEvents = false;
  @Input() public page = 0;

  public expanded = false;
  public events: IEventView[] = [];

  public pipeLng: string = this.translateService.currentLang === 'ru' ? 'ru_RU' : 'en_US';

  constructor(
    private readonly eventsService: EventsService,
    private readonly sessionService: SessionService,
    private readonly userDropdownService: UserDropdownService,
    private readonly translateService: TranslateService,
    private readonly router: Router,
  ) { super(); }

  ngOnInit(): void {
    this.getEvents();
  }

  private getEvents(): void {
    this.eventsService.get$(this.page, { after: new Date().valueOf() })
      .pipe(takeUntil(this.ngOnDestroy$))
      .subscribe((response: IPageResponse<IEventView>) => {
      this.events = response.content;
    });
  }

  public dateWithTime(event: IEventView): boolean {
    return (event.info.date % 10) === 0;
  }

  public toggleExpand(): void {
    this.expanded = !this.expanded;
  }

  public handleClick(event: any): void {
    if (!this.sessionService.loggedIn$.value) {
      event.preventDefault();
      this.userDropdownService.setShowDropdown(true);
    } else {
      this.router.navigateByUrl('/events/create');
    }
  }
}

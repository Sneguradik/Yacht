import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { ShowcasesService } from '@api/routes/showcases.service';
import { IEventView } from '@api/schemas/event/event-view.interface';
import { SessionService } from '@app/services/session.service';
import { UserDropdownService } from '@layout/shared/services/user-dropdown.service';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { BehaviorSubject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { EventsService } from '@api/routes/events.service';
import { IUserViewFull } from '@api/schemas/user/user-view-full.interface';
import { PublicationStageEnum } from '@api/schemas/article/publication-stage.enum';
import { ICreatedObject } from '@api/schemas/object/created-object.interface';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-event-preview',
  templateUrl: './event-preview.component.html',
  styleUrls: ['./event-preview.component.scss'],
})
export class EventPreviewComponent extends AbstractComponent implements OnInit, OnDestroy {
  @Output() public readonly gone: EventEmitter<number> = new EventEmitter<number>();
  @Output() public readonly goneBookmarked: EventEmitter<[IEventView, string]> = new EventEmitter<[IEventView, string]>();

  @Input() public set event(data: IEventView) {
    this.event$.next(data);
    this.isOwner = this.sessionService.userId && this.sessionService.userId === data.company.meta.id;
  }
  public get event(): IEventView {
    return this.event$.value;
  }

  public readonly event$: BehaviorSubject<IEventView> = new BehaviorSubject<IEventView>(null);
  public readonly publicationStageEnum: typeof PublicationStageEnum = PublicationStageEnum;

  public isOwner = false;

  public pipeLng: string = this.translateService.currentLang === 'ru' ? 'ru_RU' : 'en_US';

  public get dateWithTime(): boolean {
    return (this.event.info.date % 10) === 0;
  }

  constructor(
    private readonly eventsService: EventsService,
    private readonly sessionService: SessionService,
    private readonly showcaseService: ShowcasesService,
    private readonly translateService: TranslateService,
    public readonly userDropdown: UserDropdownService,
  ) { super(); }

  ngOnInit(): void {
    this.sessionService.user$.pipe(takeUntil(this.ngOnDestroy$)).subscribe((user: IUserViewFull) => {
      this.isOwner = user && user.meta.id === this.event.company.meta.id;
    });
  }

  public toggleBookmark(): void {
    if (this.sessionService.loggedIn$.value) {
      this.eventsService.bookmark$(this.event.meta.id, this.event.bookmarks.you).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
        this.event.bookmarks.you = !this.event.bookmarks.you;
        if (!this.event.bookmarks.you) {
          this.goneBookmarked.next([this.event, 'event']);
        }
      });
    } else {
      this.userDropdown.setShowDropdown(true);
    }
  }

  public hide(): void {
    const id = this.event.meta.id;
    this.eventsService.hide$(id).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
      this.gone.emit(id);
    });
  }

  public publish(value: boolean): void {
    if (value) {
      this.eventsService.publish$(this.event.meta.id).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
        this.event.info.publicationStage = PublicationStageEnum.PUBLISHED;
      });
    } else {
      this.eventsService.withdraw$(this.event.meta.id).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
        this.event.info.publicationStage = PublicationStageEnum.DRAFT;
      });
    }
  }

  public showcase(): void {
    this.eventsService.showcase$(this.event.meta.id).pipe(
      switchMap((_: ICreatedObject) => this.showcaseService.navigate$(_)),
      takeUntil(this.ngOnDestroy$)
    ).subscribe();
  }

  public delete(): void {
    const id = this.event.meta.id;
    this.eventsService.delete$(id).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
      this.gone.emit(id);
    });
  }
}

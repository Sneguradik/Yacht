import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import moment from 'moment';
import { forkJoin, of } from 'rxjs';
import { catchError, map, takeUntil, switchMap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { WysiwygEditorComponent } from '@shared/components/wysiwyg-editor/wysiwyg-editor.component';
import { EventCurrencyEnum } from '@api/schemas/event/event-currency.enum';
import { EventTypeEnum } from '@api/schemas/event/event-type.enum';
import { EVENT_TIME } from './event-time.const';
import { EventsService } from '@api/routes/events.service';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { IEventViewFull } from '@api/schemas/event/event-view-full.interface';
import { SidebarWrapperService } from '@layout/sidebar-wrapper/sidebar-wrapper.service';

@Component({
  selector: 'app-event-editor',
  templateUrl: './event-editor.component.html',
  styleUrls: ['./event-editor.component.scss'],
})
export class EventEditorComponent extends AbstractComponent implements OnInit, OnDestroy {
  @ViewChild('editor', { static: false }) private editor: WysiwygEditorComponent;

  public eventId: number;
  public formControl: FormControl = new FormControl('');
  public form: FormGroup | null = null;
  public id: number;
  public timeS = '10.00';
  public data = '';
  public openEditor = false;
  public currencySymbol: { title: string; value: EventCurrencyEnum } = {
    title: this.translateService.instant('COMMON.FREE'),
    value: EventCurrencyEnum.FREE,
  };
  public typeS: { title: string; value: any } = {
    title: this.translateService.instant('COMMON.EVENTS_TYPE'),
    value: null,
  };
  public isFirefox = navigator.userAgent.indexOf('Firefox') !== -1;
  public time: string[] = EVENT_TIME;
  public today = Date.now();

  constructor(
    private readonly eventsService: EventsService,
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly translateService: TranslateService,
    private readonly sidebarWrapperService: SidebarWrapperService
  ) { super(); }

  public ngOnInit(): void {
    setTimeout(() => {
      this.sidebarWrapperService.params$.next({ article: false, trending: true, navigation: true, live: false, showSidebar: true });
    });

    this.formInit();
    this.route.paramMap.pipe(
      map((params: ParamMap) => {
        const id = parseInt(params.get('id'), 10);
        this.updateForm(id);
      }),
      takeUntil(this.ngOnDestroy$),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.ngOnDestroy$.next();
  }

  private formInit(): void {
    this.form = this.fb.group({
      title: this.fb.control('', [Validators.required]),
      summary: this.fb.control('', [Validators.required]),
      cover: this.fb.control(''),
      date: this.fb.control(new Date()),
      price: this.fb.control(null, [Validators.min(1), Validators.max(9999999)]),
      address: this.fb.control(''),
      city: this.fb.control(''),
      announcement: this.fb.control('', [Validators.required]),
      registrationLink: this.fb.control(''),
    });
  }

  private updateForm(eventId: number): void {
    forkJoin([this.eventsService.getSingle$(eventId), this.eventsService.getSource$(eventId)]).pipe(
      map(([event, source]: [IEventViewFull, { source: string }]) => {
        this.form.setValue({
          ...this.form.value,
          title: event.info.name,
          announcement: event.info.announcement,
          registrationLink: event.body.registrationLink,
          address: event.body.address,
          city: event.info.city,
          summary: source.source,
          date: moment(event.info.date ? event.info.date : this.form.get('date').value).format('YYYY-MM-DD'),
          price: (event.info.price as any) === null ? null : (event.info.price as any) * 1,
        });

        this.data = source.source;
        if (event.info.date) {
          this.timeS = (event.info.date % 10) === 0 ? moment(event.info.date).format('HH:mm') : '-';
        }

        if (event.info.type) {
          this.typeS = {
            ...this.typeS,
            value: event.info.type,
          };
          switch (event.info.type) {
            case EventTypeEnum.CONFERENCES:
              this.typeS.title = this.translateService.instant('COMMON.PRESS-CONFERENCE');
              break;
            case EventTypeEnum.EXHIBITIONS:
              this.typeS.title = this.translateService.instant('COMMON.EXHIBIT');
              break;
            case EventTypeEnum.FLOTILLAS:
              this.typeS.title = this.translateService.instant('COMMON.FLOTILLA');
              break;
            case EventTypeEnum.FORUMS:
              this.typeS.title = this.translateService.instant('COMMON.CONFERENCE');
              break;
            case EventTypeEnum.OTHER:
              this.typeS.title = this.translateService.instant('COMMON.OTHER');
              break;
            case EventTypeEnum.PRESENTATIONS:
              this.typeS.title = this.translateService.instant('COMMON.PRESENTATIONS');
              break;
            case EventTypeEnum.REGATTAS:
              this.typeS.title = this.translateService.instant('COMMON.REGATTA');
              break;
            case EventTypeEnum.TRAINING:
              this.typeS.title = this.translateService.instant('COMMON.EDUCATION');
              break;
          }
        }

        if (event.info.currency) {
          this.currencySymbol = {
            ...this.currencySymbol,
            value: event.info.currency,
          };
          switch (event.info.currency) {
            case EventCurrencyEnum.FREE:
              this.currencySymbol.title = this.translateService.instant('COMMON.FREE');
              break;
            case EventCurrencyEnum.RUB:
              this.currencySymbol.title = this.translateService.instant('COMMON.RUB');
              break;
            case EventCurrencyEnum.EUR:
              this.currencySymbol.title = this.translateService.instant('COMMON.EUR');
              break;
            case EventCurrencyEnum.USD:
              this.currencySymbol.title = this.translateService.instant('COMMON.USD');
              break;
            case EventCurrencyEnum.NONE:
              this.currencySymbol.title = this.translateService.instant('COMMON.DO_NOT_SPECIFY');
              break;
          }
        }
        this.editor.setValue(source.source);
        this.eventId = eventId;
      }),
      catchError(() => {
        return of(null);
      }),
      takeUntil(this.ngOnDestroy$),
    ).subscribe();
  }

  private patchEvent(id: number): void {
    this.eventsService.setSource$(id, this.form.get('summary').value).pipe(
      switchMap(() => this.eventsService.patch$(id, {
        info: {
          name: this.form.get('title').value,
          announcement: this.form.get('announcement').value,
          city: this.form.get('city').value,
          date: this.getDate(),
          type: this.typeS.value,
          price: this.form.get('price').value ? this.form.get('price').value.toString() : null,
          currency: this.currencySymbol.value.toString() as any,
        },
        body: {
          registrationLink: this.form.get('registrationLink').value,
          address: this.form.get('address').value,
        },
      })),
      switchMap(() => this.eventsService.publish$(id)),
      takeUntil(this.ngOnDestroy$)
    ).subscribe(() => this.router.navigate(['/events', id]));
  }

  public selector(change: string, to: string, value?: any): void {
    switch (change) {
      case 'time':
        this.timeS = to;
        break;
      case 'currency':
        if (value === 'FREE' || value === 'NONE') {
          this.form.get('price').setValue(null);
        }
        this.currencySymbol.title = to;
        this.currencySymbol.value = value;
        break;
      case 'type':
        this.typeS.title = this.translateService.instant(to);
        this.typeS.value = value;
        break;
    }
  }

  public onSummaryChange(value: string): void {
    this.form.get('summary').setValue(value);
  }

  public onSubmit(): void {
    if (this.form.valid) {
      this.patchEvent(this.eventId);
    }
  }

  public getDate(): number {
    return moment(`${ this.form.get('date').value } ${ this.timeS !== '-' ? this.timeS : '00:00' }`,
      'YYYY-MM-DD HH.mm').valueOf() + (this.timeS !== '-' ? 0 : 1);
  }

  public openEdit(): void {
    this.openEditor = true;
    setTimeout(() => {
      this.editor.focus();
    });
  }

  public checkDate(e: any): void {
    if (!moment(e.target.valueAsDate).isValid() || e.target.valueAsNumber > moment('2099-12-31', 'yyyy-MM-dd').valueOf()) {
      e.target.valueAsNumber = moment(Date.now());
    }
  }
}

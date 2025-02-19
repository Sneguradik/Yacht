import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, DoCheck } from '@angular/core';
import { ExpandBoxTemplateEnum } from './expand-box-template.enum';
import { BehaviorSubject } from 'rxjs';
import { SessionService } from '@app/services/session.service';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-ui-expand-box',
  templateUrl: './expand-box.component.html',
  styleUrls: ['./expand-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpandBoxComponent extends AbstractComponent implements OnInit, OnDestroy, DoCheck {
  @Input() public redirectToAll: string;
  @Input() public templateType: ExpandBoxTemplateEnum;
  @Input() public data: any[] = [];
  @Input() public customFooter: boolean;
  @Input() public routerLinkPrefix: string;
  @Input() public fallbackText = 'Здесь будут компании, на которых вы подпишетесь';
  @Input() public customCD = false;

  @Output() public readonly actionEvent: EventEmitter<any> = new EventEmitter<any>();

  public readonly loggedIn$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public readonly expandBoxTemplateEnum: typeof ExpandBoxTemplateEnum = ExpandBoxTemplateEnum;

  public prevData: any[] = [];
  public expand = false;

  constructor(
    protected readonly translateService: TranslateService,
    private readonly sessionService: SessionService,
    private readonly cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscribeToLoggedIn();
  }

  ngDoCheck(): void {
    if (this.customCD) {
      if (this.data?.length === this.prevData?.length && !!this.data) {
        this.checkForChanges();
      } else {
        // Creating and assigning array with new instance of all objects of that array for proper comp
        this.prevData = this.data ? JSON.parse(JSON.stringify(this.data)) : [];
        this.cdr.markForCheck();
      }
    }
  }

  private checkForChanges(): void {
    let i = 0;
    for (const element of this.data) {
      if (this.prevData[i].subscribers?.you !== element.subscribers?.you) {
        this.prevData = this.data ? JSON.parse(JSON.stringify(this.data)) : [];
        this.cdr.markForCheck();
        return;
      } else {
        i++;
      }
    }
  }

  private subscribeToLoggedIn(): void {
    this.sessionService.loggedIn$.pipe(takeUntil(this.ngOnDestroy$)).subscribe((loggedIn: boolean) => {
      this.loggedIn$.next(loggedIn);
    });
  }

  public emitActionEvent(item: any): void {
    this.actionEvent.emit(item);
  }

  public expandFunc(): void {
    this.expand = !this.expand;
  }
}

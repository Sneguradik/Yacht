import { Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { SessionService } from '@app/services/session.service';
import { UserDropdownService } from '@layout/shared/services/user-dropdown.service';
import { ReportBlockService } from '@layout/report-block/report-block.service';
import { IReportObject } from '@layout/report-block/report-object.interface';


@Directive({
  selector: '[appReport]',
})
export class ReportDirective {
  @Input() public object: IReportObject;

  @Output() readonly report: EventEmitter<void> = new EventEmitter<void>();

  constructor(
    private readonly reportBlockService: ReportBlockService,
    private readonly sessionService: SessionService,
    private readonly userDropdownService: UserDropdownService,
  ) {}

  @HostListener('click') public onClick(): void {
    if (this.sessionService.loggedIn$.value) {
      this.reportBlockService.toggle(this.object);
      const sub: any = this.reportBlockService.reported$().subscribe((_: boolean) => {
        if (_) {
          this.report.next();
          sub.unsubscribe();
        }
      });
    } else {
      this.userDropdownService.setShowDropdown(true);
    }
  }
}

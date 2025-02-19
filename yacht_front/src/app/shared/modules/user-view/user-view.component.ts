import { Component, EventEmitter, Input, Output, OnDestroy } from '@angular/core';
import { IUserView } from '@api/schemas/user/user-view.interface';
import { UsersService } from '@api/routes/users.service';
import { SessionService } from '@app/services/session.service';
import { UserDropdownService } from '@layout/shared/services/user-dropdown.service';
import { ResponsiveService } from '@app/services/responsive.service';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-user-view',
  templateUrl: './user-view.component.html',
  styleUrls: ['./user-view.component.scss'],
})
export class UserViewComponent extends AbstractComponent implements OnDestroy {
  @Input() public data: IUserView;

  @Output() public readonly gone: EventEmitter<number> = new EventEmitter<number>();

  constructor(
    private readonly usersService: UsersService,
    private readonly sessionService: SessionService,
    private readonly userDropdownService: UserDropdownService,
    public readonly responsive: ResponsiveService,
  ) { super(); }

  public toggleSubscribe(): void {
    if (this.sessionService.loggedIn$.value) {
      this.usersService.subscribe$(this.data.meta.id, this.data.subscribers.you).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
        this.data.subscribers.you = !this.data.subscribers.you;
      });
    } else {
      this.userDropdownService.setShowDropdown(true);
    }
  }

  public delete(): void {
    this.usersService.delete$(this.data.meta.id).pipe(takeUntil(this.ngOnDestroy$)).subscribe();
  }
}

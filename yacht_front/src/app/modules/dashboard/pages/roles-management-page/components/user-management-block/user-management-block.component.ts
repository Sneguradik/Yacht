import { Component, Input, Output, EventEmitter, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { IUserWithRoleShort } from '@api/schemas/dashboard/user-with-role-short.interface';
import { BehaviorSubject } from 'rxjs';
import { IUserRoleInterface } from '@api/schemas/dashboard/user-role.interface';

@Component({
  selector: 'app-user-management-block',
  templateUrl: './user-management-block.component.html',
  styleUrls: ['./user-management-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserManagementBlockComponent {
  @Input() public users: BehaviorSubject<IUserWithRoleShort[]>;

  @Output() public readonly req: EventEmitter<IUserRoleInterface> = new EventEmitter<IUserRoleInterface>();

  @Output() public readonly pageReq: EventEmitter<void> = new EventEmitter<void>();

  public dropdown = false;

  constructor() {}

  @HostListener('window:scroll', []) public onScroll(): void {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
      this.loadNextPage();
    }
  }

  public loadNextPage(): void {
    this.pageReq.emit();
  }
}

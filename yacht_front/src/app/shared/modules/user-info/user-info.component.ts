import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IUserViewBase } from '@api/schemas/user/user-view-base.interface';


@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserInfoComponent {
  @Input() public user: IUserViewBase;
}

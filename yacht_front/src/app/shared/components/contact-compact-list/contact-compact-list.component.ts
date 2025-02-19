import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { IUserViewFull } from '@api/schemas/user/user-view-full.interface';

@Component({
  selector: 'app-contact-compact-list',
  templateUrl: './contact-compact-list.component.html',
  styleUrls: ['./contact-compact-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactCompactListComponent {
  @Input() contacts: IUserViewFull['contacts'];
  @Input() size = 20;
}

import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-ui-dropdown-menu-item',
  templateUrl: './dropdown-menu-item.component.html',
  styleUrls: ['./dropdown-menu-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropdownMenuItemComponent {
  constructor() {}
}

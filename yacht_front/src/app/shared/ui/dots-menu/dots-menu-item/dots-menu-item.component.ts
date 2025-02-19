import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-ui-dots-menu-item',
  templateUrl: './dots-menu-item.component.html',
  styleUrls: ['./dots-menu-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DotsMenuItemComponent {
  @Input() public icon: string = null;
  @Input() public text: string = null;

  constructor() { }
}

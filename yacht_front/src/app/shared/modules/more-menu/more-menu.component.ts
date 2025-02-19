import { Component, Input, ViewChild } from '@angular/core';
import { MoreMenuDirective } from './more-menu.directive';
import { MoreMenuService } from './more-menu.service';

@Component({
  selector: 'app-more-menu',
  templateUrl: './more-menu.component.html',
  styleUrls: ['./more-menu.component.scss'],
})
export class MoreMenuComponent {
  @ViewChild('menu', { static: true }) public moreMenu: MoreMenuDirective;

  @Input() public svgColor = '#92929D';

  public state = { shown: false };

  constructor(private readonly moreMenuService: MoreMenuService) {}

  public close(): void {
    this.moreMenuService.close();
  }

  public toggle(event: MouseEvent): void {
    event.stopPropagation();
    this.moreMenuService.open(this.moreMenu.templateRef, event);
  }
}

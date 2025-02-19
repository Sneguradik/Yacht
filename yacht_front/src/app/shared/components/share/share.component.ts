import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShareComponent {
  @Input() public url: string;
  @Input() public spec = false;
  @Input() public wide = false;

  public open = false;
}

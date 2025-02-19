import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-ui-label',
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiLabelComponent {
  @Input() public error = false;
  @Input() public heading = false;
  @Input() public normal = false;

  constructor() {}
}

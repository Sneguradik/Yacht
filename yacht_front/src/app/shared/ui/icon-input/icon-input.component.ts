import { Component, HostListener, Input, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-ui-icon-input',
  templateUrl: './icon-input.component.html',
  styleUrls: ['./icon-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconInputComponent {
  @Input() public type = 'text';
  @Input() public placeholder: string;
  @Input() public control: AbstractControl;
  @Input() public icon: string;

  public focus = false;

  constructor() {}

  @HostListener('focusin')
  public focusin(): void {
    this.focus = true;
  }

  @HostListener('focusout')
  public focusout(): void {
    this.focus = false;
  }
}

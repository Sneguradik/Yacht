import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-ui-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckboxComponent {
  @Input() public checked: boolean;
  @Input() public disabled = false;

  // tslint:disable-next-line:no-output-native
  @Output() public readonly change: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor() {}

  public onChange(e: Event): void {
    e.stopPropagation();
    this.checked = !this.checked;
    this.change.emit(this.checked);
  }
}

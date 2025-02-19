import { Directive, ElementRef, Input, AfterContentInit } from '@angular/core';

import { UiInputAppearance } from './ui-input-appearance.enum';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: 'input[uiInput]',
  host: {
    class: 'ui-input',
  },
})
// tslint:disable-next-line:directive-class-suffix
export class UiInput implements AfterContentInit {
  @Input() public appearance: UiInputAppearance = UiInputAppearance.outline;

  constructor(private readonly elementRef: ElementRef<HTMLInputElement>) {}

  ngAfterContentInit(): void {
    this.setAppearanceClass();
  }

  private setAppearanceClass(): void {
    this.elementRef.nativeElement.classList.add(`ui-input-${this.appearance}`);
  }
}

import { Component, ElementRef, EventEmitter, forwardRef, Input, Output, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-ui-textarea',
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextareaComponent implements ControlValueAccessor {
  @ViewChild('input', { static: true }) private input: ElementRef;

  @Output() public readonly valueChange: EventEmitter<string> = new EventEmitter<string>();

  @Input() public disabled = false;
  @Input() public placeholder = 'Напишите что-нибудь...';
  @Input() public focus = false;

  @Input() public set value(value: string) {
    this.innerValue = value;
    this.input.nativeElement.innerText = value;
  }

  public get value(): string {
    return this.innerValue;
  }

  private onTouchedCallback: () => void;
  private onChangeCallback: (value: string) => void;

  public innerValue = '';

  constructor() { }

  public registerOnChange(fn: (value: any) => void): void {
    this.onChangeCallback = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouchedCallback = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  public writeValue(value: string): void {
    if (value !== this.innerValue) {
      this.innerValue = value;
      this.input.nativeElement.innerText = value;
    }
  }

  public touched(): void {
    this.focus = true;
    if (this.onTouchedCallback) {
      this.onTouchedCallback();
    }
  }

  public change(): void {
    this.innerValue = this.input.nativeElement.innerText;

    this.valueChange.emit(this.innerValue);
    if (this.onChangeCallback) {
      this.onChangeCallback(this.innerValue);
    }
  }

  public normalize(): void {
    this.focus = false;
    this.input.nativeElement.innerText = this.innerValue;
  }
}

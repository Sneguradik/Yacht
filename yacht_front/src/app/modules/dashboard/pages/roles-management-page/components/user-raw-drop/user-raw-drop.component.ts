import { Component, Input, EventEmitter, Output, HostListener, ElementRef, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-user-raw-drop',
  templateUrl: './user-raw-drop.component.html',
  styleUrls: ['./user-raw-drop.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserRawDropComponent {
  @Input() public editor: boolean;
  @Input() public sales: boolean;
  @Input() public admin: boolean;

  @Output() public readonly editorReq: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() public readonly salesReq: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() public readonly adminReq: EventEmitter<boolean> = new EventEmitter<boolean>();

  public dropdown = false;

  constructor(private readonly ref: ElementRef) {}

  @HostListener('document:click', ['$event']) public clickOut(event: any): void {
    if (!this.ref.nativeElement.contains(event.target)) {
      this.dropdown = false;
    }
  }
}

import { Component, HostListener, ElementRef, Output, EventEmitter, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-banner-dropdown',
  templateUrl: './banner-dropdown.component.html',
  styleUrls: ['./banner-dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BannerDropdownComponent {
  @Input() public isActive: boolean;

  @Output() public readonly activeReq: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() public readonly deleteReq: EventEmitter<void> = new EventEmitter<void>();
  @Output() public readonly editReq: EventEmitter<void> = new EventEmitter<void>();

  public dropdown = false;

  constructor(private readonly ref: ElementRef) {}

  @HostListener('document:click', ['$event']) public clickOut(event: Event): void {
    if (!this.ref.nativeElement.contains(event.target)) {
      this.dropdown = false;
    }
  }

  public delete(): void {
    this.dropdown = false;
    this.deleteReq.emit();
  }

  public edit(): void {
    this.dropdown = false;
    this.editReq.emit();
  }

  public active(param: boolean): void {
    this.dropdown = false;
    this.activeReq.emit(param);
  }
}

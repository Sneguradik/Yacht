import { AfterViewInit, Component, ElementRef, Input, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { IMenuState } from '@layout/shared/interfaces/menu-state.interface';

import { fromEvent } from 'rxjs';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'app-ui-dropdown-menu',
  templateUrl: './dropdown-menu.component.html',
  styleUrls: ['./dropdown-menu.component.scss']
})
export class DropdownMenuComponent extends AbstractComponent implements AfterViewInit, OnDestroy {
  @ViewChild('dropdown') private dropdown: ElementRef;

  @Input() public width: number;
  @Input() public height: number;
  @Input() public dropdownExtraClass = '';

  public state: IMenuState = { shown: false, sub: null };

  constructor(private elementRef: ElementRef, private readonly cdr: ChangeDetectorRef) { super(); }

  public ngAfterViewInit(): void {
    const menuItems: HTMLElement[] = Array.from(this.elementRef.nativeElement.querySelectorAll('app-ui-dropdown-menu-item'));
    menuItems.forEach((item: HTMLElement) => item.addEventListener('click', this.toggle.bind(this)));
  }

  public toggle(): void {
    if (this.state.shown) {
      requestAnimationFrame(() => {
        this.state.sub.unsubscribe();
        this.state.shown = false;
        this.cdr.markForCheck();
      });
    } else {
      this.state.shown = true;
      setTimeout(() => {
        this.state.sub = fromEvent(document, 'click', {
          capture: true,
        }).pipe(takeUntil(this.ngOnDestroy$)).subscribe((e: FocusEvent) => {
          if (this.dropdown && !this.dropdown.nativeElement.contains(e.target)) {
            requestAnimationFrame(() => {
              this.state.sub.unsubscribe();
              this.state.shown = false;
              this.cdr.markForCheck();
            });
          }
        });
      }, 0);
    }
  }
}

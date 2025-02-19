import { Component, OnDestroy, HostBinding, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { IMenuState } from '@layout/shared/interfaces/menu-state.interface';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-ui-dots-menu',
  templateUrl: './dots-menu.component.html',
  styleUrls: ['./dots-menu.component.scss']
})
export class DotsMenuComponent extends AbstractComponent implements OnDestroy, AfterViewInit {
  @ViewChild('dropdown', { static: false }) private dropdown: ElementRef;

  @HostBinding('class.has-dropdown') public hostClassHasDropdown = true;
  @HostBinding('class.v-center') public hostClassVCenter = true;

  @Input() public svgColor = '#92929D';

  public readonly state: IMenuState = { shown: new BehaviorSubject<boolean>(false), sub: null };
  public readonly shown: BehaviorSubject<boolean> = this.state.shown as BehaviorSubject<boolean>;

  constructor(private readonly elementRef: ElementRef) {
    super();
  }

  ngAfterViewInit(): void {
    const menuItems: HTMLElement[] = Array.from(this.elementRef.nativeElement.querySelectorAll('app-ui-dots-menu-item'));
    menuItems.forEach((item: HTMLElement) => item.addEventListener('click', this.toggle.bind(this)));
  }

  public toggle(event: MouseEvent): void {
    event.stopPropagation();
    if (this.state.shown instanceof BehaviorSubject) {
      if (this.state.shown.value) {
        this.state.sub.unsubscribe();
        this.state.shown.next(false);
      } else {
        this.state.shown.next(true);
        setTimeout(() => {
          this.state.sub = fromEvent(document, 'click', {
            capture: true,
          }).pipe(takeUntil(this.ngOnDestroy$)).subscribe((e: FocusEvent) => {
            if (!this.dropdown.nativeElement.contains(e.target)) {
              requestAnimationFrame(() => {
                this.state.sub.unsubscribe();
                if (this.state.shown instanceof BehaviorSubject) {
                  this.state.shown.next(false);
                }
              });
            }
          });
        }, 0);
      }
    }
  }
}

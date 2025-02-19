import {
  Component,
  ContentChild,
  ElementRef,
  ChangeDetectionStrategy,
  AfterViewInit,
  Renderer2, ContentChildren, QueryList,
} from '@angular/core';
import { fromEvent } from 'rxjs';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-ui-form-control',
  templateUrl: './form-control.component.html',
  styleUrls: ['./form-control.component.scss', '../input/ui-input.style.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormControlComponent extends AbstractComponent implements AfterViewInit {
  @ContentChild('input', { static: true }) public inputRef: ElementRef;
  @ContentChild('svg', { static: true }) public iconRef: ElementRef;

  @ContentChild('formControlHeader', { static: true }) public formControlHeader: ElementRef;
  @ContentChildren('formControlAction', { descendants: true }) public formControlAction: QueryList<any>;

  constructor(private renderer: Renderer2) {
    super();
  }

  // private setIconPosition(icon: HTMLElement): void {
  //   const input: HTMLElement = this.elementRef.nativeElement.querySelector('input');
  //
  //   if (!input) {
  //     throw new Error('Input is required when you use svg icons!');
  //   }
  //
  //   const horizontalSpace: string = window.getComputedStyle(input).getPropertyValue('padding-right');
  //
  //   icon.style.position = 'absolute';
  //   icon.style.right = horizontalSpace;
  // }

  private setHeaderBackGroundColor(color: string): void {
    this.renderer.setStyle(this.formControlHeader.nativeElement, 'color', color);
  }

  private addFocusEvent(): void {
    if (this.formControlHeader && this.formControlAction.first) {
      const element = this.formControlAction.first.nativeElement
        ? this.formControlAction.first.nativeElement
        : (this.formControlAction as any).first.editorOut.elementRef.nativeElement;
      fromEvent(element, 'focusin')
        .pipe(takeUntil(this.ngOnDestroy$))
        .subscribe(() => this.setHeaderBackGroundColor('#00b7ff'));
      fromEvent(element, 'focusout')
        .pipe(takeUntil(this.ngOnDestroy$))
        .subscribe(() => this.setHeaderBackGroundColor(null));
    }
  }

  ngAfterViewInit(): void {
    // const icon: HTMLElement = this.elementRef.nativeElement.querySelector('svg');
    this.formControlAction.changes.subscribe(() => this.addFocusEvent());
    this.addFocusEvent();
    // if (icon) {
    //   this.setIconPosition(icon);
    // }
  }
}

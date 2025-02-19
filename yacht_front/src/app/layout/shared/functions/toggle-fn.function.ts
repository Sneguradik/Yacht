import { ElementRef } from '@angular/core';
import { fromEvent, MonoTypeOperatorFunction } from 'rxjs';
import { IMenuState } from '../interfaces/menu-state.interface';

export function toggleFn(
  state: IMenuState,
  ref: () => ElementRef,
  pipeFn: MonoTypeOperatorFunction<FocusEvent>,
  onCloseFn?: CallableFunction
): (() => void) {
  const x: any = () => {
    if (state.shown) {
      state.sub.unsubscribe();
      state.shown = false;
      onCloseFn();
    } else {
      state.shown = true;
      setTimeout(() => {
        ref().nativeElement.focus();
        state.sub = fromEvent(document, 'blur', {
          capture: true,
        }).pipe(pipeFn).subscribe((e: FocusEvent) => {
          if (!ref().nativeElement.contains(e.relatedTarget)) {
            state.sub.unsubscribe();
            state.shown = false;
            onCloseFn();
          }
        });
      }, 0);
    }
  };
  return x;
}

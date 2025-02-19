import { Subject } from 'rxjs';
import { Component, OnDestroy } from '@angular/core';

@Component({
  template: ''
})
export abstract class AbstractComponent implements OnDestroy {
  protected readonly ngOnDestroy$: Subject<void> = new Subject<void>();

  ngOnDestroy(): void {
    this.ngOnDestroy$.next();
  }
}

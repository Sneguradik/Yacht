import { Injectable, TemplateRef } from '@angular/core';
import { MoreMenuWrapperComponent } from './more-menu-wrapper/more-menu-wrapper.component';

@Injectable({
  providedIn: 'root',
})
export class MoreMenuService {
  public wrapper: MoreMenuWrapperComponent;

  constructor() {}

  public close(): void {
    this.wrapper.close();
  }

  public open(templateRef: TemplateRef<any>, event: MouseEvent): void {
    this.wrapper.open(templateRef, event);
  }
}

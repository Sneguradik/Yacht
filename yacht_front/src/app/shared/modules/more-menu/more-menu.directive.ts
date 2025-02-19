import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appMoreMenu]',
  exportAs: 'moreMenu',
})
export class MoreMenuDirective {
  constructor(public templateRef: TemplateRef<any>) {}
}

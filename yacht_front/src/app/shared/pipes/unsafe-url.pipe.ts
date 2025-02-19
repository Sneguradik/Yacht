import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'unsafeUrl',
})
export class UnsafeUrlPipe implements PipeTransform {
  constructor(private readonly domSanitizer: DomSanitizer) {}

  transform(value: string): any {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(value);
  }
}

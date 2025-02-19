import { Pipe, PipeTransform } from '@angular/core';
import { Router } from '@angular/router';
import { PlatformLocation } from '@angular/common';
import { PlatformService } from '@shared/services/platform.service';
import { environment } from '@env';

@Pipe({
  name: 'url',
})
export class UrlPipe implements PipeTransform {
  constructor(
    private readonly router: Router,
    private readonly platformLocation: PlatformLocation,
    private readonly platformService: PlatformService
  ) {}

  transform(value: any[] | null, fragment?: string): string {
    if (value === null) {
      const href = this.platformService.isServer ? environment.url : (this.platformLocation as any).location.href;
      return href + (fragment ? '#' + fragment : '');
    }
    const origin = this.platformService.isServer ? environment.url : (this.platformLocation as any).location.origin;
    return `${ origin }${ this.router.serializeUrl(this.router.createUrlTree(value)) }${ fragment ? `#${ fragment }` : '' }`;
  }
}

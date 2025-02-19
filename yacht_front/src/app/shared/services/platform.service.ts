import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class PlatformService {
  public isBrowser: boolean;
  public isServer: boolean;

  constructor(@Inject(PLATFORM_ID) private readonly platformID: any) {
    this.isBrowser = false;
    this.isServer = false;

    if (isPlatformBrowser(this.platformID)) {
      this.isBrowser = true;
    } else if (isPlatformServer(this.platformID)) {
      this.isServer = true;
    }
  }
}

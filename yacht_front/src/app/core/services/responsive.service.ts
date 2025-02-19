import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { PlatformService } from '@shared/services/platform.service';

@Injectable({
  providedIn: 'root'
})
export class ResponsiveService {
  public readonly width$: BehaviorSubject<number> = new BehaviorSubject(this.platformService.isBrowser ? window.innerWidth : 1920);
  public readonly height$: BehaviorSubject<number> = new BehaviorSubject(this.platformService.isBrowser ? window.innerHeight : 1080);

  public readonly breakpoints: any = { xlarge: 1400, large: 1060, medium: 740, small: 375 };

  public readonly lt: any = {
    small: this.width$.pipe(map((_: number) => _ < this.breakpoints.small)),
    medium: this.width$.pipe(map((_: number) => _ < this.breakpoints.medium)),
    large: this.width$.pipe(map((_: number) => _ < this.breakpoints.large)),
    xlarge: this.width$.pipe(map((_: number) => _ < this.breakpoints.xlarge)),
  };

  public readonly mt: any = {
    small: this.width$.pipe(map((_: number) => _ > this.breakpoints.small)),
  };

  public medium: any = this.width$.pipe(map((_: number) => _ >= this.breakpoints.medium && _ < this.breakpoints.large));
  public large: any = this.width$.pipe(map((_: number) => _ >= this.breakpoints.large && _ < this.breakpoints.xlarge));
  public small: any = this.width$.pipe(map((_: number) => _ < this.breakpoints.medium));

  constructor(
    private readonly platformService: PlatformService
  ) {
    if (this.platformService.isBrowser) {
      window.addEventListener('resize', this.onResize.bind(this));
    }
  }

  public onResize(event: Event): void {
    this.width$.next((event.target as Window).innerWidth);
    this.height$.next((event.target as Window).innerHeight);
  }
}

import { Injectable } from '@angular/core';
import { ISidebarWrapperParams } from './sidebar-wrapper-params.interface';
import { BehaviorSubject } from 'rxjs';
import { Router, NavigationEnd, Event } from '@angular/router';
import { first, filter } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class SidebarWrapperService {
  public readonly params$: BehaviorSubject<ISidebarWrapperParams> = new BehaviorSubject<ISidebarWrapperParams>({ showSidebar: true });

  constructor(private readonly router: Router) {
    this.router.events.pipe(filter((events: Event) => events instanceof NavigationEnd), first()).subscribe((event: NavigationEnd) => {
      if (event.urlAfterRedirects.includes('/dashboard/')) {
        this.params$.next({ showSidebar: false });
      }
    });
  }

  public clear(): void {
    this.params$.next({ showSidebar: false });
  }
}

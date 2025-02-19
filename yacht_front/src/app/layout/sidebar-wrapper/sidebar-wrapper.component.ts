import { Component, OnInit } from '@angular/core';
import { Router, Event, NavigationStart } from '@angular/router';
import { ResponsiveService } from '@app/services/responsive.service';
import { SessionService } from '@app/services/session.service';
import { SidebarWrapperService } from './sidebar-wrapper.service';
import { filter, takeUntil } from 'rxjs/operators';
import { AbstractComponent } from '@shared/classes/abstract-component.class';

@Component({
  selector: 'app-sidebar-wrapper',
  templateUrl: './sidebar-wrapper.component.html',
  styleUrls: ['./sidebar-wrapper.component.scss']
})
export class SidebarWrapperComponent extends AbstractComponent implements OnInit {
  public readonly homeRoute: string = this.router.url;

  public liveContent =  true;
  public trending = true;

  public verticalMenu: any = {
    left: false,
    right: false,
    article: false
  };

  constructor(
    private readonly router: Router,
    public readonly sidebarWrapperService: SidebarWrapperService,
    public readonly responsive: ResponsiveService,
    public readonly session: SessionService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.router.events.pipe(
      filter((event: Event) => event instanceof NavigationStart),
      takeUntil(this.ngOnDestroy$)
    ).subscribe(() => {
      this.verticalMenu = {
        left: false,
        right: false,
        article: false
      };
    });
  }

  public isOpen(menu: { [menu: string]: boolean }): boolean {
    return Object.values(menu).indexOf(true) !== -1;
  }

  public toggleVerticalMenu(name: string): void {
    const result: any = { ...this.verticalMenu };
    for (const menu of Object.keys(result)) {
      result[menu] = menu === name ? !result[menu] : false;
    }
    this.verticalMenu = result;
  }

  public closeVerticalMenu(): void {
    const result: any = { ...this.verticalMenu };
    for (const menu of Object.keys(result)) {
      result[menu] = false;
    }
    this.verticalMenu = result;
  }

  public scrollTop(): void {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  }
}

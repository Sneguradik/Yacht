import { Component, OnDestroy, OnInit } from '@angular/core';
import { ShowcasesService } from '@api/routes/showcases.service';
import { IShowcasePatch } from '@api/schemas/showcase/showcase-patch.interface';
import { ShowcaseEditBlockService } from '@layout/sidebar-wrapper/live-content/showcase-edit-block.service';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { ICreatedObject } from '@api/schemas/object/created-object.interface';
import { SidebarWrapperService } from '@layout/sidebar-wrapper/sidebar-wrapper.service';


@Component({
  selector: 'app-all-events-page',
  templateUrl: './all-events-page.component.html',
  styleUrls: ['./all-events-page.component.scss'],
})
export class AllEventsPageComponent extends AbstractComponent implements OnInit, OnDestroy {
  constructor(
    private readonly showcaseService: ShowcasesService,
    private readonly showcaseEBS: ShowcaseEditBlockService,
    private readonly sidebarWrapperService: SidebarWrapperService
  ) {
    super();
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.sidebarWrapperService.params$.next({ article: false, trending: true, navigation: true, live: false, showSidebar: true });
    });
  }

  public showcase(): void {
    this.showcaseService.create$().pipe(
      switchMap((res: ICreatedObject) => {
        const data: IShowcasePatch = {
          info: {
            url: 'https://ru.yachtsmanjournal.com/events',
            title: 'Все мероприятия',
            subtitle: 'Перейти ко всем мероприятиям',
          },
        };
        return this.showcaseService.patch$(res.id, data).pipe(tap(() => {
          this.showcaseEBS.setId(res.id);
        }));
      }),
      takeUntil(this.ngOnDestroy$)
    ).subscribe(() => {
      this.showcaseEBS.toggle();
    });
  }
}

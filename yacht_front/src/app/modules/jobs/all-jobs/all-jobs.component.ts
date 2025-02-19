import { Component, OnDestroy, OnInit } from '@angular/core';
import { ShowcasesService } from '@api/routes/showcases.service';
import { ICreatedObject } from '@api/schemas/object/created-object.interface';
import { IShowcasePatch } from '@api/schemas/showcase/showcase-patch.interface';
import { ShowcaseEditBlockService } from '@layout/sidebar-wrapper/live-content/showcase-edit-block.service';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { takeUntil, switchMap, tap } from 'rxjs/operators';
import { SidebarWrapperService } from '@layout/sidebar-wrapper/sidebar-wrapper.service';


@Component({
  selector: 'app-all-jobs',
  templateUrl: './all-jobs.component.html',
  styleUrls: ['./all-jobs.component.scss'],
})
export class AllJobsComponent extends AbstractComponent implements OnInit, OnDestroy {
  public own = false;
  public isPublic = true;

  constructor(
    private readonly showcaseService: ShowcasesService,
    private readonly showcaseEBS: ShowcaseEditBlockService,
    private readonly sidebarWrapperService: SidebarWrapperService
  ) { super(); }

  ngOnInit(): void {
    setTimeout(() => {
      this.sidebarWrapperService.params$.next({ article: false, trending: true, navigation: true, live: false, showSidebar: true });
    });
  }

  public showcase(): void {
    this.showcaseService.create$().pipe(
      switchMap((_: ICreatedObject) => {
        const data: IShowcasePatch = {
          info: {
            url: 'https://ru.yachtsmanjournal.com/jobs',
            title: 'Все вакансии',
            subtitle: 'Перейти ко всем вакансиям',
          },
        };
        return this.showcaseService.patch$(_.id, data).pipe(
          tap(() => {
            this.showcaseEBS.setId(_.id);
            this.showcaseEBS.toggle();
          })
        );
      }),
      takeUntil(this.ngOnDestroy$)
    ).subscribe();
  }
}

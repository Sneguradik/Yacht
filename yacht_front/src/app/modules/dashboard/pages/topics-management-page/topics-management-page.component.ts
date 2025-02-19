import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntil, tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { ITopicView } from '@api/schemas/topic/topic-view.interface';
import { ITopicPageableContent } from './topic-pageable-content.interface';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { TopicsService } from '@api/routes/topics.service';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { ISelectItem } from '@modules/dashboard/shared/ui/dashboard-select/select-item.interface';
import { SidebarWrapperService } from '@layout/sidebar-wrapper/sidebar-wrapper.service';
import { LocaleEnum } from '@api/schemas/locale/locale.enum';

@Component({
  selector: 'app-topics-management-page',
  templateUrl: './topics-management-page.component.html',
  styleUrls: ['./topics-management-page.component.scss'],
})
export class TopicsManagementPageComponent extends AbstractComponent implements OnInit, OnDestroy {
  public allTopicsToItem$: BehaviorSubject<ITopicPageableContent> = new BehaviorSubject<ITopicPageableContent>({
    content: [],
    currentPage: 0,
    totalPages: 1,
    contentLoading: false,
  });

  public panel: { show: boolean; delete: boolean } = { show: false, delete: false };
  public body: { name: string; url: string };
  public del: { id: number; tags: string; dId: number };
  public currName: string;

  constructor(
    private readonly topicsService: TopicsService,
    private readonly router: Router,
    private readonly sidebarWrapperService: SidebarWrapperService
  ) {
    super();
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.sidebarWrapperService.params$.next({ article: false, trending: false, navigation: false, live: false, showSidebar: false });
    });
    this.getTopics();
  }

  public getTopics(): void {
    const allTopicsToItem = this.allTopicsToItem$.getValue();
    const hasContent: boolean = allTopicsToItem.content === [] || allTopicsToItem.currentPage + 1 <= allTopicsToItem.totalPages;
    if (hasContent && !allTopicsToItem.contentLoading) {
      allTopicsToItem.contentLoading = true;
      this.topicsService.get$(allTopicsToItem.currentPage, { locale: LocaleEnum.ALL })
          .pipe(takeUntil(this.ngOnDestroy$))
          .subscribe((topic: IPageResponse<ITopicView>) => {
            topic.content.forEach((e: ITopicView) => {
              allTopicsToItem.content.push({
                id: e.meta.id,
                title: e.info.name,
              });
            });

            allTopicsToItem.totalPages = topic.totalPages;
            allTopicsToItem.currentPage++;
            allTopicsToItem.contentLoading = false;

            if (allTopicsToItem.currentPage + 1 <= allTopicsToItem.totalPages) {
              this.getTopics();
            } else {
              allTopicsToItem.content = allTopicsToItem.content
              .sort((one: ISelectItem, two: ISelectItem) => (one.title > two.title ? 1 : -1));
            }
            this.allTopicsToItem$.next(allTopicsToItem);
          });
      }
  }

  public create(body: { name: string; url: string }): void {
    this.currName = body.name;
    this.panel.delete = false;
    this.panel.show = true;
    this.body = body;
  }

  public delete(id: number, tags: string, dId: number, name: string): void {
    this.currName = name;
    this.panel.delete = true;
    this.panel.show = true;
    this.del = { id, tags, dId };
  }

  public action(): void {
    if (!this.panel.delete) {
      this.topicsService.post$(this.body)
        .pipe(takeUntil(this.ngOnDestroy$))
        .subscribe((res: number) => {
        this.router.navigate(['/topics', res, 'edit']);
      });
    } else {
        const tagsArray: string[] = this.del.tags.replace(/\s+/g, '').split(',').slice(0, 10);
        this.topicsService.deleteAdvanced$(this.del.id, tagsArray.toString() || null, this.del.dId)
            .pipe(
                tap(() => this._deleteItemInSubject()),
                takeUntil(this.ngOnDestroy$))
            .subscribe(() => {
          this.panel.show = false;
        });
    }
  }

  private _deleteItemInSubject(): void {
    this.allTopicsToItem$.next({
      ...this.allTopicsToItem$.getValue(),
      content: this.allTopicsToItem$.getValue().content.filter((item: ISelectItem) => item.id !== this.del.id)
    });
  }

  public cancel(): void {
    this.panel.show = false;
  }
}

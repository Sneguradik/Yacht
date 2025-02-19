import { Component, OnInit, OnDestroy } from '@angular/core';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { Subject, Observable } from 'rxjs';
import { PageableContent } from '@shared/classes/pageable-conetnt.class';
import { IUserViewFull } from '@api/schemas/user/user-view-full.interface';
import { ITagView } from '@api/schemas/tags/tag-view.interface';
import { TagOrderEnum } from '@api/schemas/tags/tag-order.enum';
import { SessionService } from '@app/services/session.service';
import { TagsService } from '@api/routes/tags.service';
import { ITagQuery } from '@api/schemas/tags/tag-query.interface';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { takeUntil, startWith, map, filter, debounceTime, switchMap } from 'rxjs/operators';
import { SidebarWrapperService } from '@layout/sidebar-wrapper/sidebar-wrapper.service';

@Component({
  selector: 'app-tag-list-page',
  templateUrl: './tag-list-page.component.html',
  styleUrls: ['./tag-list-page.component.scss']
})
export class TagListPageComponent extends AbstractComponent implements OnInit, OnDestroy {
  public readonly searchQuery$: Subject<string> = new Subject<string>();
  public readonly recent: PageableContent<ITagView, IUserViewFull> =
    new PageableContent<ITagView, IUserViewFull>((page: number) => this.fetch$(page, { seen: true }));
  public readonly popular: PageableContent<ITagView> =
    new PageableContent<ITagView>((page: number) => this.fetch$(page, { order: TagOrderEnum.POST_COUNT }));
  public readonly found: PageableContent<ITagView, string> =
    new PageableContent<ITagView, string>((page: number, query: string) => this.fetch$(page, { query }));

  public hasSearchQuery$: Observable<boolean>;

  constructor(
    private readonly tagsService: TagsService,
    private readonly sessionService: SessionService,
    private readonly sidebarWrapperService: SidebarWrapperService
  ) {
    super();
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.sidebarWrapperService.params$.next({ article: false, trending: true, navigation: true, live: false, showSidebar: true });
    });

    this.popular.fetch();
    this.setQueries();
  }

  private setQueries(): void {
    this.hasSearchQuery$ = this.searchQuery$.pipe(
      startWith(false),
      map((_: string | boolean) => !!_),
      takeUntil(this.ngOnDestroy$),
    );
    this.sessionService.user$.pipe(
      filter((_: IUserViewFull) => !!_),
      switchMap((user: IUserViewFull) => this.recent.setOptionsWithReset$(user)),
      takeUntil(this.ngOnDestroy$),
    ).subscribe();
    this.searchQuery$.pipe(
      debounceTime(750),
      filter((_: string) => !!_),
      switchMap((query: string) => this.found.setOptionsWithReset$(query)),
      takeUntil(this.ngOnDestroy$),
    ).subscribe();
    this.searchQuery$.pipe(
      filter((_: string) => !_),
      switchMap(() => this.found.reset$()),
      takeUntil(this.ngOnDestroy$),
    ).subscribe();
  }

  public fetch$(page: number, query: ITagQuery): Observable<IPageResponse<ITagView>> {
    return this.tagsService.get$(page, query).pipe(takeUntil(this.ngOnDestroy$));
  }

  public handleSearch(query: string): void {
    this.searchQuery$.next(query);
  }
}

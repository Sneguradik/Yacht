import { Component, Input, Output, EventEmitter, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { ITagDashboardView } from '@api/schemas/dashboard/tag-dashboard-view.interface';
import { BehaviorSubject } from 'rxjs';
import { ITotalTags } from '@modules/dashboard/pages/tags-management-page/total-tags.interface';
import { IDeletionTagInterface } from '@api/schemas/dashboard/deletion-tag.interface';

@Component({
  selector: 'app-all-tags-block',
  templateUrl: './all-tags-block.component.html',
  styleUrls: ['./all-tags-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AllTagsBlockComponent {
  @Input() public tags$: BehaviorSubject<ITagDashboardView[]>;
  @Input() public allTags$: BehaviorSubject<ITotalTags>;

  @Output() private readonly nextPageReq: EventEmitter<void> = new EventEmitter<void>();
  @Output() private readonly deleteReq: EventEmitter<IDeletionTagInterface> = new EventEmitter<IDeletionTagInterface>();

  constructor() {}

  @HostListener('window:scroll', [])  public onScroll(): void {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
      this.loadNextPage();
    }
  }

  public loadNextPage(): void {
    this.nextPageReq.emit();
  }

  public delete(item: ITagDashboardView): void {
    this.deleteReq.emit({ id: item.meta.id });
  }
}

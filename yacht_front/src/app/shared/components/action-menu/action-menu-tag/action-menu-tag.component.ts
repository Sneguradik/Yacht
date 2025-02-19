import { Component, EventEmitter, Input, Output, OnDestroy } from '@angular/core';
import { switchMap, takeUntil } from 'rxjs/operators';
import { ITagView } from '@api/schemas/tags/tag-view.interface';
import { ShowcasesService } from '@api/routes/showcases.service';
import { TagsService } from '@api/routes/tags.service';
import { ICreatedObject } from '@api/schemas/object/created-object.interface';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { ReportEntityTypeEnum } from '@api/schemas/report/report-entity-type.enum';

@Component({
  selector: 'app-action-menu-tag',
  templateUrl: './action-menu-tag.component.html',
  styleUrls: ['./action-menu-tag.component.scss'],
})
export class ActionMenuTagComponent extends AbstractComponent implements OnDestroy {
  @Input() public data: ITagView;

  @Output() public readonly gone: EventEmitter<ITagView> = new EventEmitter<ITagView>();

  public readonly reportEntityTypeEnum: typeof ReportEntityTypeEnum = ReportEntityTypeEnum;

  constructor(
    private readonly tagsService: TagsService,
    private readonly showcasesService: ShowcasesService
  ) {
    super();
  }

  public showcase(): void {
    this.tagsService.showcase$(this.data.meta.id).pipe(
      switchMap((_: ICreatedObject) => this.showcasesService.navigate$(_)),
      takeUntil(this.ngOnDestroy$)
    ).subscribe();
  }

  public delete(): void {
    const d = this.data;
    this.tagsService.delete$(d.meta.id).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => this.gone.next(d));
  }
}

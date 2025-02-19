import { Component, OnInit, OnDestroy } from '@angular/core';
import { DynamicMetaTagsService } from './dynamic-meta-tags.service';
import { Title, Meta, MetaDefinition } from '@angular/platform-browser';
import { takeUntil, map, filter } from 'rxjs/operators';
import { IMetaInfo } from './meta-info.interface';
import { AbstractComponent } from '@shared/classes/abstract-component.class';

@Component({
  selector: 'app-dynamic-meta-tags',
  template: ''
})
export class DynamicMetaTagsComponent extends AbstractComponent implements OnInit, OnDestroy {
  constructor(private readonly dynamicMetaTagsService: DynamicMetaTagsService, private readonly title: Title, private readonly meta: Meta) {
    super();
  }

  ngOnInit(): void {
    this.dynamicMetaTagsService.metaInfo$.pipe(
      filter((metaInfo: IMetaInfo) => !!metaInfo),
      map((metaInfo: IMetaInfo) => this.setInfo(metaInfo)),
      takeUntil(this.ngOnDestroy$)
    ).subscribe();
  }

  private setInfo(data: IMetaInfo): void {
    this.title.setTitle(data.title);
    data.tags.forEach((tag: MetaDefinition) => {
      this.meta.updateTag(tag);
    });
  }
}

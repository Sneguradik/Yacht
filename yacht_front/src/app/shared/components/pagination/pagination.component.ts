import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PageableContent } from '@shared/classes/pageable-conetnt.class';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { takeUntil } from 'rxjs/operators';
import { ScrollTrigger } from '@shared/classes/scroll-trigger.class';
import { PlatformService } from '@shared/services/platform.service';

@Component({
  selector: 'app-pagination',
  template: '',
})
export class PaginationComponent extends AbstractComponent implements OnInit {
  @Input() public page = 0;
  @Input() public enabled: boolean;
  @Input() public maxPages: number;
  @Input() public fireFirstPage = true;
  @Input() public pageable: PageableContent<any> | null = null;

  // tslint:disable:no-output-on-prefix
  @Output() public readonly onPage: EventEmitter<number> = new EventEmitter<number>();
  @Output() public readonly onPageAttempt: EventEmitter<void> = new EventEmitter<void>();
  // tslint:enable:no-output-on-prefix

  public scrollTrigger: ScrollTrigger;

  constructor(private readonly platformService: PlatformService) {
    super();
  }

  ngOnInit(): void {
    if (this.platformService.isBrowser) {
      setTimeout(() => {
        if (this.fireFirstPage) {
          if (this.pageable) {
            this.pageable.fetch();
          } else {
            this.onPage.emit(this.page);
          }
        }
        this.initInfiniteScroll();
      });
    }
  }

  private initInfiniteScroll(): void {
    this.scrollTrigger = new ScrollTrigger();
    this.scrollTrigger.scroll$.pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => this.onScroll());
  }

  private onScroll(): void {
    if (this.pageable) {
      if (this.pageable.page >= this.pageable.totalPages - 1) {
        this.onPageAttempt.emit();
      }
      this.pageable.fetch();
    } else if (this.enabled) {
      if (this.page < this.maxPages) {
        this.page++;
        this.onPage.emit(this.page);
      } else {
        this.onPageAttempt.emit();
      }
    }
  }
}

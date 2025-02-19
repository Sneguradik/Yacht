import { Component, EmbeddedViewRef, OnInit, TemplateRef, ViewChild, ViewContainerRef, OnDestroy } from '@angular/core';
import { fromEvent } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { PlatformService } from '@shared/services/platform.service';

@Component({
  selector: 'app-more-menu-wrapper',
  templateUrl: './more-menu-wrapper.component.html',
  styleUrls: ['./more-menu-wrapper.component.scss'],
})
export class MoreMenuWrapperComponent extends AbstractComponent implements OnInit, OnDestroy {
  @ViewChild('ref', { read: ViewContainerRef, static: true }) public containerRef: ViewContainerRef;

  private current: EmbeddedViewRef<any>;

  public shown = false;

  constructor(public readonly viewRef: ViewContainerRef, public readonly platformService: PlatformService) { super(); }

  ngOnInit(): void {
    if (this.platformService.isBrowser) {
      fromEvent(document, 'click', { capture: true })
        .pipe(
          filter(() => this.shown),
          takeUntil(this.ngOnDestroy$)
        ).subscribe((e: FocusEvent) => {
        if (!this.viewRef.element.nativeElement.contains(e.target)) {
          this.close();
          e.stopPropagation();
        }
      });
    }
  }

  public close(): void {
    this.shown = false;
    if (this.current != null) {
      this.current.destroy();
      this.current = null;
    }
  }

  public open(ref: TemplateRef<any>, event: MouseEvent): void {
    this.close();
    this.current = this.containerRef.createEmbeddedView(ref);
    this.current.detectChanges();
    this.shown = true;

    const el = this.viewRef.element.nativeElement;
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    el.style.left = `${rect.left + rect.width}px`;
    el.style.top = `${rect.top + rect.height - 16}px`;
  }
}

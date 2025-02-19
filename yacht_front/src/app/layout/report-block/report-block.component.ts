import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReportBlockService } from './report-block.service';
import { Router, Event, NavigationEnd } from '@angular/router';
import { ReportService } from '@api/routes/report.service';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { takeUntil } from 'rxjs/operators';
import { IReportObject } from './report-object.interface';

@Component({
  selector: 'app-report-block',
  templateUrl: './report-block.component.html',
  styleUrls: ['./report-block.component.scss']
})
export class ReportBlockComponent extends AbstractComponent implements OnInit, OnDestroy {
  public object: IReportObject;
  public message = '';

  constructor(
    private readonly reportService: ReportService,
    private readonly router: Router,
    public readonly reportBlockService: ReportBlockService,
  ) { super(); }

  ngOnInit(): void {
    this.router.events.pipe(takeUntil(this.ngOnDestroy$)).subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.message = '';
      }
    });
  }

  public report(): void {
    this.object = this.reportBlockService.object;
    this.reportService.send$(this.object.type, this.object.id, this.message).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
      this.reportBlockService.report();
    });
  }
}

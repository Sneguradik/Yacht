import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IReportObject } from './report-object.interface';


@Injectable({
  providedIn: 'root',
})
export class ReportBlockService {
  private readonly shown: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private readonly reported: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public object: IReportObject;

  constructor() {}

  public toggle(object?: IReportObject): void {
    this.shown.next(!this.shown.value);
    if (object) {
      this.object = object;
    }
  }

  public state$(): BehaviorSubject<boolean> {
    return this.shown;
  }

  public reported$(): BehaviorSubject<boolean> {
    return this.reported;
  }

  public report(): void {
    this.reported.next(true);
    this.reported.next(false);
  }
}

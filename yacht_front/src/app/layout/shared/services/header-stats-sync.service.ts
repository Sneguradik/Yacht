import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderStatsSyncService {
  public readonly articlesCountSyncEvent$: ReplaySubject<never> = new ReplaySubject<never>(1);
  /**
   * @description - [item type, id, status]
   */
  public readonly subEvent$: ReplaySubject<['topic' | 'company', number, boolean]>
    = new ReplaySubject<['topic' | 'company', number, boolean]>(1);

  constructor() {
    this.articlesCountSyncEvent$.next();
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FeedSourceEnum } from '@shared/enums/feed-source.enum';

@Injectable({
  providedIn: 'root'
})
export class HomepageService {
  public readonly feedSource$: BehaviorSubject<FeedSourceEnum> = new BehaviorSubject<FeedSourceEnum>(FeedSourceEnum.NONE);

  constructor() { }
}

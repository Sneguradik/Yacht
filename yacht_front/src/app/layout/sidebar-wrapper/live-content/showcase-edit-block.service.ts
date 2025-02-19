import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { ICreatedObject } from '@api/schemas/object/created-object.interface';

@Injectable({
  providedIn: 'root'
})
export class ShowcaseEditBlockService {
  private readonly open: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private readonly id: BehaviorSubject<number> = new BehaviorSubject<number>(-1);

  public readonly refresh$: Subject<never> = new Subject<never>();

  constructor() {}

  public toggle(): void {
    this.open.next(!this.open.value);
  }

  public getValue(): BehaviorSubject<boolean> {
    return this.open;
  }

  public setId(id: number): void {
    this.id.next(id);
  }

  public getId$(): BehaviorSubject<number> {
    return this.id;
  }

  public navigate$(created: ICreatedObject): Observable<boolean> {
    this.setId(created.id);
    this.toggle();
    return of(true);
  }
}

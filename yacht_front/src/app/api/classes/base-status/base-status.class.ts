import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ApiService } from '@api/services/api.service';
import { ICreatedObject } from '@api/schemas/object/created-object.interface';
import { BaseStatusActionEnum } from './base-status-action.enum';
import { VoteActionValues } from '@shared/components/voting/voting.const';
import { Store } from '@ngxs/store';
import { EUserStatsProperty } from '@app/store/user-stats/enums/user-stats-property.enum';
import { AddToProperty } from '@app/store/user-stats/actions/add-to-property.action';

export class BaseStatus {
  constructor(
    protected readonly apiService: ApiService,
    private readonly url: string,
    protected readonly store: Store
  ) {}

  protected toggleStatus$<T = never>(id: number, action: BaseStatusActionEnum, undo?: boolean, body?: any): Observable<T | never> {
    return undo
      ? this.apiService.delete$<never>(`${ this.url }/${ id }/${ action }`)
      : this.apiService.post$<T>(`${ this.url }/${ id }/${ action }`, body);
  }

  public hide$(id: number, undo?: boolean): Observable<never> {
    return this.toggleStatus$(id, BaseStatusActionEnum.HIDE, undo);
  }

  public bookmark$(id: number, undo?: boolean): Observable<never> {
    return this.toggleStatus$(id, BaseStatusActionEnum.BOOKMARK, undo).pipe(
      tap(() => this.store.dispatch(new AddToProperty(undo ? -1 : 1, EUserStatsProperty.PROMOTED)))
    );
  }

  public subscribe$(id: number, undo?: boolean): Observable<never> {
    return this.toggleStatus$(id, BaseStatusActionEnum.SUBSCRIBE, undo);
  }

  public vote$(id: number, undo: boolean, vote?: VoteActionValues): Observable<never> {
    return this.toggleStatus$(id, BaseStatusActionEnum.VOTE, undo, { value: vote });
  }

  /**
   * Accepted resources:
   * Article, User, Company, Tag, Topic, Job, Event
   */
  public showcase$(id: number): Observable<ICreatedObject> {
    return this.toggleStatus$<ICreatedObject>(id, BaseStatusActionEnum.SHOWCASE);
  }

  public view$(id: number): Observable<void> {
    return this.toggleStatus$(id, BaseStatusActionEnum.VIEW).pipe(
      catchError((err: any) => {
        if (err.status === 409) {
          return of(null);
        }
      }),
    );
  }
}

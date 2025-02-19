import { IObject } from '@api/schemas/object/object.interface';
import { ReplaySubject, Subject, Observable, forkJoin } from 'rxjs';
import { ApiService } from '@api/services/api.service';
import { bufferTime, filter, tap, catchError, first, map, switchMap } from 'rxjs/operators';
import { orderObjects } from '@api/functions/order-object.function';
import { PlatformService } from '@shared/services/platform.service';
import { ErrorMessageEnum } from '@shared/enums/error-message.enum';

export class CachedGetMany<T extends IObject> {
  private readonly cache: Map<number, ReplaySubject<T>> = new Map<number, ReplaySubject<T>>();
  private readonly fetch$: Subject<number> = new Subject<number>();

  constructor(private readonly apiService: ApiService, private readonly url: string, private readonly platformService: PlatformService) {
    this.fetch$.pipe(
      this.platformService.isBrowser ? bufferTime(500) : map((_: number) => [_]),
      filter((_: number[]) => _.length !== 0),
      switchMap((_: number[]) => this.platformService.isBrowser ? this.getMany$(_) : this.get$(_)),
    ).subscribe();
  }

  private getMany$(ids: number[]): Observable<T[]> {
    return this.apiService.get$<T[]>(`${ this.url }/(${ ids.join(',') })`, true).pipe(
      tap((array: T[]) => {
        ids.forEach((id: number) => {
          const value: T = array.find((it: T) => it.meta.id === +id);
          value ? this.cache.get(id).next(value) : this.cache.get(id).error(new Error(ErrorMessageEnum.NOT_FOUND));
        });
      }),
      catchError((error: any) => {
        ids.forEach((id: number) => this.cache.get(id).error(error));
        throw error;
      }),
    );
  }

  private createSubject$(id: number): ReplaySubject<T> {
    let result: ReplaySubject<T>;
    if (!this.cache.has(id)) {
      result = new ReplaySubject<T>(1);
      result.subscribe({
        error: (err: any) => {
          this.cache.delete(id);
          throw err;
        },
      });
      this.cache.set(id, result);
      this.fetch$.next(id);
    } else {
      result = this.cache.get(id);
    }
    return result;
  }

  public get$(ids: number[]): Observable<T[]> {
    const missing: number[] = ids.filter((id: number) => !this.cache.has(id));
    missing.forEach((id: number) => this.createSubject$(id));
    const cached: any[] = ids.map((id: number) => this.cache.get(id).pipe(first()));
    return forkJoin(cached).pipe(map((array: T[]) => array.sort(orderObjects(ids))));
  }
}

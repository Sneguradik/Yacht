import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { debounce, filter, first, tap, mapTo } from 'rxjs/operators';

export const NO_CONTENT = Symbol('NO_CONTENT');

export class PageableContent<T, O = any> {
  public readonly isFetching$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public readonly content$: Subject<T[]> = new Subject<T[]>();
  public readonly options$: BehaviorSubject<O>;
  public readonly end$ = new Subject();

  public content: T[] = [];
  public page = -1;
  public totalPages = 1;

  private readonly fetchCommand$: Subject<never> = new Subject<never>();

  constructor(
    private readonly fetchNextFn$: (page: number, options: O) => Observable<IPageResponse<T>>,
    options: O = null
  ) {
    this.options$ = new BehaviorSubject<O>(options);
    this.fetchCommand$.pipe(debounce(() => this.isFetching$.pipe(filter((_: boolean) => !_)))).subscribe(() => this.fetchNextPage());
  }

  public fetch(): void {
    if (this.page < this.totalPages - 1) {
      this.fetchCommand$.next();
    }
  }

  public reset$(hard: boolean = true): Observable<any> {
    return this.isFetching$.pipe(
      filter((it: boolean) => !it),
      first(),
      tap(() => {
        if (hard) {
          this.content.splice(0, this.content.length);
        }
        this.page = -1;
        this.totalPages = 1;
      }),
    );
  }

  public setOptionsWithReset$(options: O, hard: boolean = true): Observable<O> {
    return this.reset$(hard).pipe(
      tap(() => {
        this.options$.next(options);
        this.fetch();
      }),
      mapTo(options),
    );
  }

  private fetchNextPage(): void {
    this.isFetching$.next(true);
    this.fetchNextFn$(this.page + 1, this.options$.value).subscribe(
      (response: IPageResponse<T>) => {
        this.page = response.page;
        this.totalPages = response.totalPages;
        this.content$.next(response.content);
        if (this.page >= this.totalPages - 1) {
          this.end$.next();
        }
        this.content.push(...response.content);
        this.isFetching$.next(false);
      },
      (error: any) => {
        this.isFetching$.next(false);
        if (error !== Symbol('NO_CONTENT')) {
          throw error;
        }
      },
    );
  }
}

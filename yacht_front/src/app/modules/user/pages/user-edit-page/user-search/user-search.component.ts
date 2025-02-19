import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { IUserView } from '@api/schemas/user/user-view.interface';
import { UsersService } from '@api/routes/users.service';
import { debounceTime, tap, filter, map, switchMap, takeUntil } from 'rxjs/operators';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { LocaleEnum } from '@api/schemas/locale/locale.enum';

@Component({
  selector: 'app-user-search',
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.scss']
})
export class UserSearchComponent extends AbstractComponent implements OnInit, OnDestroy {
  @Input() public members: IUserView[];

  @Output() public readonly addUser: EventEmitter<IUserView> = new EventEmitter<IUserView>();

  private readonly query$: Subject<string> = new Subject<string>();

  public hasFocus = false;
  public filteredUsers: IUserView[] = [];

  constructor(private readonly usersService: UsersService) { super(); }

  ngOnInit(): void {
    this.subscribeToQueryChange();
  }

  private subscribeToQueryChange(): void {
    this.query$.pipe(
      debounceTime(300),
      tap((query: string) => {
        if (query === '') {
          this.filteredUsers = [];
        }
      }),
      filter((query: string) => query !== ''),
      switchMap((query: string) => this.search$(query)),
      takeUntil(this.ngOnDestroy$)
    ).subscribe((users: IUserView[]) => {
      this.filteredUsers = users;
    });
  }

  private search$(query: string): Observable<IUserView[]> {
    return this.usersService.get$(0, { query, locale: LocaleEnum.ALL }).pipe(map((response: IPageResponse<IUserView>) => response.content));
  }

  public isMember(id: number): boolean {
    return !!this.members.find((member: IUserView) => member.meta.id === id);
  }

  public onSearchChange(query: string): void {
    this.query$.next(query);
  }

  public onAddClick(user: IUserView): void {
    this.addUser.emit(user);
  }
}

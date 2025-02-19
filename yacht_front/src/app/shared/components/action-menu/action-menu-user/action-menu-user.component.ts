import { Component, EventEmitter, Input, Output, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { switchMap, takeUntil } from 'rxjs/operators';
import { IUserViewFull } from '@api/schemas/user/user-view-full.interface';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { IUserView } from '@api/schemas/user/user-view.interface';
import { UsersService } from '@api/routes/users.service';
import { ShowcasesService } from '@api/routes/showcases.service';
import { ICreatedObject } from '@api/schemas/object/created-object.interface';
import { ReportEntityTypeEnum } from '@api/schemas/report/report-entity-type.enum';

@Component({
  selector: 'app-action-menu-user',
  templateUrl: './action-menu-user.component.html',
  styleUrls: ['./action-menu-user.component.scss'],
})
export class ActionMenuUserComponent extends AbstractComponent implements OnDestroy {
  @Input() public set data(data: IUserView) {
    this._data = data;
  }

  public get data(): IUserView {
    return this._data;
  }

  @Output() public readonly gone: EventEmitter<IUserView> = new EventEmitter<IUserView>();

  // tslint:disable-next-line:variable-name
  private _data: IUserView | IUserViewFull;

  public readonly reportEntityTypeEnum: typeof ReportEntityTypeEnum = ReportEntityTypeEnum;

  constructor(
    private readonly usersService: UsersService,
    private readonly showcasesService: ShowcasesService,
    private readonly router: Router
  ) {
    super();
  }

  public hide(): void {
    const d = this.data;
    this.usersService.hide$(d.meta.id, d.hidden).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
      d.hidden = !d.hidden;
      if (d.hidden) {
        this.gone.next(d);
      }
    });
  }

  public setBanned(ban: boolean): void {
    this.usersService.ban$(this.data.meta.id, ban).pipe(takeUntil(this.ngOnDestroy$)).subscribe();
  }

  public setCompany(company: boolean): void {
    this.usersService.setCompanyStatus$(this.data.meta.id, company).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
      this.data.info.company.isCompany = company;
      this.data.info.company.confirmed = company;
    });
  }

  public edit(): void {
    this.router.navigate(['/user', this.data.meta.id, 'edit']);
  }

  public hasRole(role: string): boolean {
    const data = this.data as IUserViewFull;
    return data.roles && data.roles.indexOf(role) >= 0;
  }

  public delete(): void {
    const d = this.data;
    this.usersService.delete$(d.meta.id).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
      this.gone.next(d);
    });
  }

  public setRole(role: string, status: boolean): void {
    const data = this.data as IUserViewFull;
    if (data) {
      this.usersService.setRole$(data.meta.id, role, status).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
        if (status && !this.hasRole(role)) { data.roles.push(role); }
        if (!status && this.hasRole(role)) { data.roles.splice(data.roles.indexOf(role), 1); }
      });
    }
  }

  public showcase(): void {
    this.usersService.showcase$(this.data.meta.id).pipe(
      switchMap((_: ICreatedObject) => this.showcasesService.navigate$(_))
    ).subscribe();
  }
}

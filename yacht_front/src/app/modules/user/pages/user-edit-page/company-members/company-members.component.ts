import { Component, OnInit, Input } from '@angular/core';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { IUserView } from '@api/schemas/user/user-view.interface';
import { CompaniesService } from '@api/routes/companies.service';
import { takeUntil, startWith, toArray, map, switchMap } from 'rxjs/operators';
import { Observable, range, of } from 'rxjs';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { flatten } from '@angular/compiler';
import { PageableContent, NO_CONTENT } from '@shared/classes/pageable-conetnt.class';

@Component({
  selector: 'app-company-members',
  templateUrl: './company-members.component.html',
  styleUrls: ['./company-members.component.scss']
})
export class CompanyMembersComponent extends AbstractComponent implements OnInit {
  @Input() public id: number;

  public readonly pageable: PageableContent<IUserView, number> = new PageableContent<IUserView, number>(this.fetch$.bind(this), null);

  public members: IUserView[];
  public isMemberSearchVisible = false;

  constructor(private readonly companiesService: CompaniesService) {
    super();
  }

  ngOnInit(): void {
    this.fetchMembers$(this.id).pipe(takeUntil(this.ngOnDestroy$)).subscribe((members: IUserView[]) => (this.members = members));
  }

  private fetchMembers$(id: number): Observable<IUserView[]> {
    return this.companiesService.members$(id, 0).pipe(
      switchMap((response: IPageResponse<IUserView>) => {
        return response.totalPages > 1
          ? range(1, response.totalPages - 1).pipe(
            switchMap((i: number) => this.companiesService.members$(id, i)),
            startWith(response),
          )
          : of(response);
      }),
      toArray(),
      map((responses: IPageResponse<IUserView>[]) =>
        responses.sort((a: IPageResponse<IUserView>, b: IPageResponse<IUserView>) => a.page - b.page)
          .map((response: IPageResponse<IUserView>) => response.content)),
      map((contents: IUserView[][]) => {
        return flatten(contents);
      }),
    );
  }

  public fetch$(page: number, id: number): Observable<IPageResponse<IUserView>> {
    if (id === null) {
      throw NO_CONTENT;
    }
    return this.companiesService.members$(id, page);
  }

  public onAddMemberClick(): void {
    this.isMemberSearchVisible = true;
  }

  public onAddMember(member: IUserView): void {
    this.companiesService.toggleMember$(this.id, member.meta.id, false).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
      this.members.push(member);
    });
  }

  public onRemoveMemberClick(member: IUserView): void {
    this.companiesService.toggleMember$(this.id, member.meta.id, true).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
      this.members.splice(
        this.members.findIndex((user: IUserView) => user === member),
        1,
      );
    });
  }
}

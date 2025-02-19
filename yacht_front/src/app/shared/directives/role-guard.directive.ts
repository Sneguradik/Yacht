import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { tap } from 'rxjs/operators';
import { PermissionService } from '@app/services/permission/permission.service';

@Directive({
  selector: '[appRoleGuard]',
})
export class RoleGuardDirective {
  @Input() public set appRoleGuard(guard: string[] | keyof PermissionService['roles']) {
    this.roles = this.resolveRoles(guard);
    this.update();
  }
  @Input() public set appRoleGuardAnd(and: boolean) {
    this.and = and;
    this.update();
  }
  @Input() public set appRoleGuardOr(or: boolean) {
    this.or = or;
    this.update();
  }

  private roles: string[] = [];
  private and: boolean = null;
  private or: boolean = null;

  constructor(
    private readonly permissionService: PermissionService,
    private readonly templateRef: TemplateRef<any>,
    private readonly viewContainer: ViewContainerRef,
  ) {}

  public resolveRoles(guard: string[] | keyof PermissionService['roles']): string[] {
    if (typeof guard === 'string') {
      const value = this.permissionService.roles[guard];
      if (typeof value === 'string') {
        return [value];
      }
      return value;
    }
    return guard;
  }

  public update(): void {
    const and: boolean = this.and !== false;
    const or: boolean = this.or === true;
    this.permissionService.hasAnyRole$(this.roles).pipe(
      tap((hasRole: boolean) => {
        if (and && (or || hasRole)) {
          this.viewContainer.clear();
          this.viewContainer.createEmbeddedView(this.templateRef);
        } else {
          this.viewContainer.clear();
        }
      }),
    ).subscribe();
  }
}

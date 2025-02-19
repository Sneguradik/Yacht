import { NgModule } from '@angular/core';
import { LetDirective } from './let.directive';
import { ReportDirective } from './report.directive';
import { RoleGuardDirective } from './role-guard.directive';
import { LoggedInDirective } from './logged-in.directive';

@NgModule({
  declarations: [ReportDirective, RoleGuardDirective, LetDirective, LoggedInDirective],
  exports: [ReportDirective, RoleGuardDirective, LetDirective, LoggedInDirective],
})
export class CommonDirectivesModule {}

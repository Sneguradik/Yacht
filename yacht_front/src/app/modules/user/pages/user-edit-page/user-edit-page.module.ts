import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserEditPageRoutingModule } from './user-edit-page-routing.module';
import { UserEditPageComponent } from './user-edit-page.component';
import { CompanyMembersComponent } from './company-members/company-members.component';
import { NotificationsControlComponent } from './notifications-control/notifications-control.component';
import { UserSearchComponent } from './user-search/user-search.component';
import { SharedUiModule } from '@shared/ui/shared-ui.module';
import { SharedPipesModule } from '@shared/pipes/shared-pipes.module';
import { SharedComponentsModule } from '@shared/components/shared-components.module';
import { SvgModule } from '@shared/modules/svg/svg.module';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CommonDirectivesModule } from '@shared/directives/directives.module';


@NgModule({
  declarations: [UserEditPageComponent, CompanyMembersComponent, NotificationsControlComponent, UserSearchComponent],
  imports: [
    CommonModule,
    UserEditPageRoutingModule,
    SharedUiModule,
    SharedPipesModule,
    SharedComponentsModule,
    SvgModule,
    ReactiveFormsModule,
    TranslateModule.forChild(),
    CommonDirectivesModule
  ]
})
export class UserEditPageModule { }

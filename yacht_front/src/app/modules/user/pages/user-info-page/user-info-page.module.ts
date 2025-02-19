import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserInfoPageRoutingModule } from './user-info-page-routing.module';
import { UserInfoPageComponent } from './user-info-page.component';
import { SharedUiModule } from '@shared/ui/shared-ui.module';
import { SharedPipesModule } from '@shared/pipes/shared-pipes.module';
import { SvgModule } from '@shared/modules/svg/svg.module';
import { SharedComponentsModule } from '@shared/components/shared-components.module';
import { UserHeaderModule } from '@modules/user/user-header/user-header.module';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [UserInfoPageComponent],
  imports: [
    CommonModule,
    UserInfoPageRoutingModule,
    SharedComponentsModule,
    UserHeaderModule,
    SharedUiModule,
    SharedPipesModule,
    SvgModule,
    TranslateModule.forChild()
  ]
})
export class UserInfoPageModule { }

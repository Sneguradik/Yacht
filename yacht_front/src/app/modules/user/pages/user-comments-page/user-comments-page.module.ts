import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserCommentsPageRoutingModule } from './user-comments-page-routing.module';
import { UserCommentsPageComponent } from './user-comments-page.component';
import { SharedComponentsModule } from '@shared/components/shared-components.module';
import { UserHeaderModule } from '@modules/user/user-header/user-header.module';
import { SharedUiModule } from '@shared/ui/shared-ui.module';
import { TranslateModule } from '@ngx-translate/core';
import { RangesModule } from '@shared/modules/ranges/ranges.module';


@NgModule({
  declarations: [UserCommentsPageComponent],
  imports: [
    CommonModule,
    UserCommentsPageRoutingModule,
    SharedComponentsModule,
    UserHeaderModule,
    SharedUiModule,
    TranslateModule,
    RangesModule
  ]
})
export class UserCommentsPageModule { }

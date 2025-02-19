import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserNotificationsPageRoutingModule } from './user-notifications-page-routing.module';
import { UserNotificationsPageComponent } from './user-notifications-page.component';
import { NotificationComponent } from './notification/notification.component';
import { RangesModule } from '@shared/modules/ranges/ranges.module';
import { SharedUiModule } from '@shared/ui/shared-ui.module';
import { SharedComponentsModule } from '@shared/components/shared-components.module';
import { SharedPipesModule } from '@shared/pipes/shared-pipes.module';
import { SvgModule } from '@shared/modules/svg/svg.module';
import { UserHeaderModule } from '@modules/user/user-header/user-header.module';
import { TranslateModule } from '@ngx-translate/core';
import { LayoutModule } from '@layout/layout.module';
import { CommonDirectivesModule } from '@shared/directives/directives.module';
import { PersonNamePipe } from '@shared/pipes/person-name.pipe';


@NgModule({
  declarations: [UserNotificationsPageComponent, NotificationComponent],
  imports: [
    CommonModule,
    CommonDirectivesModule,
    UserNotificationsPageRoutingModule,
    RangesModule,
    SharedUiModule,
    SharedComponentsModule,
    SharedPipesModule,
    SvgModule,
    UserHeaderModule,
    TranslateModule.forChild(),
    LayoutModule,
  ],
  providers: [
    PersonNamePipe
  ]
})
export class UserNotificationsPageModule { }

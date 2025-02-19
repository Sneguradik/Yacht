import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EventPageRoutingModule } from './event-page-routing.module';
import { EventPageUnwrapComponent } from './event-page-unwrap.component';
import { EventPageComponent } from './event-page.component';
import { AngularYandexMapsModule } from 'angular8-yandex-maps';
import { SharedUiModule } from '@shared/ui/shared-ui.module';
import { SharedComponentsModule } from '@shared/components/shared-components.module';
import { SharedPipesModule } from '@shared/pipes/shared-pipes.module';
import { CommonDirectivesModule } from '@shared/directives/directives.module';
import { SvgModule } from '@shared/modules/svg/svg.module';
import { UserInfoModule } from '@shared/modules/user-info/user-info.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [EventPageUnwrapComponent, EventPageComponent],
  imports: [
    CommonModule,
    EventPageRoutingModule,
    SharedUiModule,
    UserInfoModule,
    SvgModule,
    SharedComponentsModule,
    SharedPipesModule,
    CommonDirectivesModule,
    SharedUiModule,
    AngularYandexMapsModule,
    TranslateModule.forChild(),
  ],
  exports: [EventPageUnwrapComponent],
})
export class EventPageModule {}

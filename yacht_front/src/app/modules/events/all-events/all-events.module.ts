import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EventPreviewModule } from '../event-preview/event-preview.module';
import { AllEventsPageComponent } from './all-events-page.component';
import { AllEventsRoutingModule } from './all-events-routing.module';
import { EventListComponent } from './event-list/event-list.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedUiModule } from '@shared/ui/shared-ui.module';
import { SharedComponentsModule } from '@shared/components/shared-components.module';
import { CommonDirectivesModule } from '@shared/directives/directives.module';
import { FiltersModule } from '@shared/modules/filters/filters.module';

@NgModule({
  declarations: [AllEventsPageComponent, EventListComponent],
  imports: [
    AllEventsRoutingModule,
    CommonModule,
    EventPreviewModule,
    FiltersModule,
    CommonDirectivesModule,
    TranslateModule,
    SharedUiModule,
    SharedComponentsModule
  ],
  exports: [AllEventsPageComponent],
})
export class AllEventsModule {}

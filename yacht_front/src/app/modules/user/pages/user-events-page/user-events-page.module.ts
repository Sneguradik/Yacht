import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserEventsPageRoutingModule } from './user-events-page-routing.module';
import { UserEventsPageComponent } from './user-events-page.component';
import { FiltersModule } from '@shared/modules/filters/filters.module';
import { SharedComponentsModule } from '@shared/components/shared-components.module';
import { EventPreviewModule } from '@modules/events/event-preview/event-preview.module';


@NgModule({
  declarations: [UserEventsPageComponent],
  imports: [
    CommonModule,
    UserEventsPageRoutingModule,
    FiltersModule,
    SharedComponentsModule,
    EventPreviewModule,
    SharedComponentsModule
  ]
})
export class UserEventsPageModule { }

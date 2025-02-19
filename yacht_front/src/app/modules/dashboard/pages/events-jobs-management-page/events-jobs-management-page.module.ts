import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EventsJobsManagementPageRoutingModule } from './events-jobs-management-page-routing.module';
import { EventsJobsManagementPageComponent } from './events-jobs-management-page.component';
import { EventsJobsManagementBlockComponent } from './components/events-jobs-management-block/events-jobs-management-block.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [EventsJobsManagementPageComponent, EventsJobsManagementBlockComponent],
    imports: [CommonModule, EventsJobsManagementPageRoutingModule, FormsModule, TranslateModule, ReactiveFormsModule],
})
export class EventsJobsManagementPageModule {}

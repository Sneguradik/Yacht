import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ActivityManagementPageRoutingModule } from './activity-management-page-routing.module';
import { ActivityManagementPageComponent } from './activity-management-page.component';
import { ActivityBlockComponent } from './components/activity-block/activity-block.component';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardRangeModule } from '@modules/dashboard/shared/ui/dashboard-range/dashboard-range.module';

@NgModule({
  declarations: [ActivityManagementPageComponent, ActivityBlockComponent],
  imports: [CommonModule, ActivityManagementPageRoutingModule, FormsModule, DashboardRangeModule, TranslateModule],
})
export class ActivityManagementPageModule {}

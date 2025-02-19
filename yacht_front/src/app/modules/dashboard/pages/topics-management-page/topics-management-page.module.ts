import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TopicsManagementPageRoutingModule } from './topics-management-page-routing.module';
import { TopicsManagementPageComponent } from './topics-management-page.component';
import { TopicsBlockComponent } from './components/topics-block/topics-block.component';
import { TopicsPanelComponent } from './components/topics-panel/topics-panel.component';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardSelectModule } from '@modules/dashboard/shared/ui/dashboard-select/dashboard-select.module';

@NgModule({
  declarations: [TopicsManagementPageComponent, TopicsBlockComponent, TopicsPanelComponent],
  imports: [CommonModule, TopicsManagementPageRoutingModule, DashboardSelectModule, FormsModule, TranslateModule],
})
export class TopicsManagementPageModule {}

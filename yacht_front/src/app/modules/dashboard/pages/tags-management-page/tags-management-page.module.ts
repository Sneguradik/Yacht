import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TagsManagementPageRoutingModule } from './tags-management-page-routing.module';
import { TagsManagementPageComponent } from './tags-management-page.component';

import { AllTagsBlockComponent } from './components/all-tags-block/all-tags-block.component';
import { StatisticTagsBlockComponent } from './components/statistic-tags-block/statistic-tags-block.component';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardRangeModule } from '@modules/dashboard/shared/ui/dashboard-range/dashboard-range.module';
import { DashboardTabsModule } from '@modules/dashboard/shared/ui/dashboard-tabs/dashboard-tabs.module';

@NgModule({
  declarations: [TagsManagementPageComponent, AllTagsBlockComponent, StatisticTagsBlockComponent],
  imports: [CommonModule, TagsManagementPageRoutingModule, DashboardTabsModule, FormsModule, DashboardRangeModule, TranslateModule],
})
export class TagsManagementPageModule {}

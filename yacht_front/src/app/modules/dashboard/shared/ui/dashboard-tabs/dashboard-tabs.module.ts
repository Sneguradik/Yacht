import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardTabsComponent } from './dashboard-tabs.component';
import { DashboardSelectModule } from '../dashboard-select/dashboard-select.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [DashboardTabsComponent],
  exports: [DashboardTabsComponent],
  imports: [CommonModule, DashboardSelectModule, TranslateModule.forChild()],
})
export class DashboardTabsModule {}

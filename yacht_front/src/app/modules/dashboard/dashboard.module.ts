import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { CommonDirectivesModule } from '@shared/directives/directives.module';
import { SharedUiModule } from '@shared/ui/shared-ui.module';

@NgModule({
  declarations: [DashboardComponent],
  imports: [CommonModule, DashboardRoutingModule, CommonDirectivesModule, SharedUiModule],
})
export class DashboardModule {}

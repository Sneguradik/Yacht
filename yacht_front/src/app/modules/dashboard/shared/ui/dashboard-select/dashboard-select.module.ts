import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardSelectComponent } from './dashboard-select.component';

@NgModule({
  declarations: [DashboardSelectComponent],
  exports: [DashboardSelectComponent],
  imports: [CommonModule],
})
export class DashboardSelectModule {}

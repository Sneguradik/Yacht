import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRangeComponent } from './dashboard-range.component';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [DashboardRangeComponent],
  exports: [DashboardRangeComponent],
  imports: [CommonModule, FormsModule, TranslateModule.forChild()],
})
export class DashboardRangeModule {}

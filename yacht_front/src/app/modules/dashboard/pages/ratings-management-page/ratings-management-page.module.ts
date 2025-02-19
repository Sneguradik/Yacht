import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RatingsManagementPageRoutingModule } from './ratings-management-page-routing.module';
import { RatingsManagementPageComponent } from './ratings-management-page.component';
import { RatingsFormBlockComponent } from './components/ratings-form-block/ratings-form-block.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardSelectModule } from '@modules/dashboard/shared/ui/dashboard-select/dashboard-select.module';

@NgModule({
  declarations: [
      RatingsManagementPageComponent,
      RatingsFormBlockComponent
  ],
  imports: [
      CommonModule,
      RatingsManagementPageRoutingModule,
      FormsModule,
      DashboardSelectModule,
      TranslateModule,
      ReactiveFormsModule
    ],
})
export class RatingsManagementPageModule {}

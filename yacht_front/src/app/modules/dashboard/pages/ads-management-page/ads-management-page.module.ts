import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { AdsManagementPageRoutingModule } from './ads-management-page-routing.module';
import { AdsManagementPageComponent } from './ads-management-page.component';
import { CreateBannerComponent } from './components/create-banner/create-banner.component';
import { BannerListComponent } from './components/banner-list/banner-list.component';
import { BannerEditorComponent } from './components/banner-editor/banner-editor.component';
import { BannerDropdownComponent } from './components/banner-dropdown/banner-dropdown.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardSelectModule } from '@modules/dashboard/shared/ui/dashboard-select/dashboard-select.module';
import { CommonDirectivesModule } from '@shared/directives/directives.module';

@NgModule({
  declarations: [
      AdsManagementPageComponent,
      CreateBannerComponent,
      BannerListComponent,
      BannerEditorComponent,
      BannerDropdownComponent
  ],
  imports: [
      CommonModule,
      AdsManagementPageRoutingModule,
      FormsModule,
      DashboardSelectModule,
      CommonDirectivesModule,
      TranslateModule,
      ReactiveFormsModule
  ],
  providers: [
      DatePipe
  ]
})
export class AdsManagementPageModule {}

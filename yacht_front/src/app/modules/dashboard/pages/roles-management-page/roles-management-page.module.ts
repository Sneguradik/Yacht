import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RolesManagementPageRoutingModule } from './roles-management-page-routing.module';
import { RolesManagementPageComponent } from './roles-management-page.component';
import { UserManagementBlockComponent } from './components/user-management-block/user-management-block.component';
import { UserRawDropComponent } from './components/user-raw-drop/user-raw-drop.component';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardTabsModule } from '@modules/dashboard/shared/ui/dashboard-tabs/dashboard-tabs.module';
import { SharedUiModule } from '@shared/ui/shared-ui.module';

@NgModule({
  declarations: [RolesManagementPageComponent, UserManagementBlockComponent, UserRawDropComponent],
  imports: [CommonModule, RolesManagementPageRoutingModule, DashboardTabsModule, FormsModule, TranslateModule, SharedUiModule],
})
export class RolesManagementPageModule {}

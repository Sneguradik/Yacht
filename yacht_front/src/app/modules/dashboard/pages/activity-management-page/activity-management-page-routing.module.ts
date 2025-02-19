import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ActivityManagementPageComponent } from './activity-management-page.component';

const routes: Routes = [
  {
    path: '',
    component: ActivityManagementPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ActivityManagementPageRoutingModule {}

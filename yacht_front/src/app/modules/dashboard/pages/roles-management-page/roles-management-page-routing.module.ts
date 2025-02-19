import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RolesManagementPageComponent } from './roles-management-page.component';

const routes: Routes = [
  {
    path: '',
    component: RolesManagementPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RolesManagementPageRoutingModule {}

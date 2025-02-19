import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdsManagementPageComponent } from './ads-management-page.component';

const routes: Routes = [
  {
    path: '',
    component: AdsManagementPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdsManagementPageRoutingModule {}
